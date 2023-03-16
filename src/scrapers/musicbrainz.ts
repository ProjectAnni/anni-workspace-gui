import axios from "axios";
import { uniqBy } from "lodash";
import { ParsedAlbumData, ParsedTrackData } from "@/types/album";
import { parseCatalog, sleep, stringifyArtists } from "@/utils/helper";
import Logger from "@/utils/log";
import BaseScraper, { ScraperSearchResult } from "./base";
import dayjs from "dayjs";
import { guessTrackType } from "./utils";

const RelationTypes = {
    MemberOfGroup: "5be4c609-9afa-4ea0-910b-12ffb71e3821",
    VoiceActor: "e259a3f5-ce8e-45c1-9ef7-90ff7d0c7589",
} as const;

interface MiniArtistItem {
    id: string;
    name: string;
    children: MiniArtistItem[];
}

class MusicBrainzScraper extends BaseScraper {
    characterPersonMap = new Map<string, MiniArtistItem>();
    groupGroupMemberMap = new Map<string, MiniArtistItem[]>();

    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        const [result1, result2] = await Promise.all([
            album.catalog ? this.searchByCatalog(album.catalog) : Promise.resolve([]),
            album.title ? this.searchByTitle(album.title) : Promise.resolve([]),
        ]);
        return uniqBy([...result1, ...result2], "id");
    }

    public async getDetail(result: ScraperSearchResult): Promise<Omit<ParsedAlbumData, "album_id"> | null> {
        return this.getReleaseInfo(result.id);
    }
    private async searchByTitle(title: string): Promise<ScraperSearchResult[]> {
        const API = `https://musicbrainz.org/ws/2/release?query=${title}&limit=10&fmt=json`;
        const searchResult = await axios.get(API).then((res) => res.data);
        const releases = searchResult?.releases;
        const result: ScraperSearchResult[] = [];
        if (!releases.length) {
            return result;
        }
        for (const release of releases) {
            result.push({
                id: release.id,
                exactMatch: release.title === title,
                title: release.title,
                artists:
                    release["artist-credit"]?.length > 0
                        ? release["artist-credit"].map((credit: any) => credit.name).join("、")
                        : "",
                releaseDate: release.date,
                trackCount: release["track-count"] || undefined,
            });
        }
        return result;
    }
    private async searchByCatalog(catalog: string): Promise<ScraperSearchResult[]> {
        const parsedCatalog = parseCatalog(catalog);
        const API = `https://musicbrainz.org/ws/2/release?query=catno:${parsedCatalog[0]}&fmt=json`;
        const searchResult = await axios.get(API).then((res) => res.data);
        const releases = searchResult?.releases;
        const result: ScraperSearchResult[] = [];
        if (!releases.length) {
            return result;
        }
        for (const release of releases) {
            if (release["label-info"].some((labelInfo: any) => labelInfo["catalog-number"] === parsedCatalog[0])) {
                result.push({
                    id: release.id,
                    exactMatch: true,
                    title: release.title,
                    artists:
                        release["artist-credit"]?.length > 0
                            ? release["artist-credit"].map((credit: any) => credit.name).join("、")
                            : "",
                    releaseDate: release.date,
                    trackCount: release["track-count"] || undefined,
                });
            }
        }
        return result;
    }

    private async getReleaseInfo(releaseId: string): Promise<Omit<ParsedAlbumData, "album_id">> {
        Logger.info(`[MusicBrainz] Get release info, releaseId: ${releaseId}`);
        const API = `https://musicbrainz.org/ws/2/release/${releaseId}?inc=recordings+artist-credits+labels&fmt=json`;
        const albumData = await axios.get(API).then((res) => res.data);
        await sleep(1500); // API Rate Limit
        const title = albumData.title;
        const catalog = albumData["label-info"]?.[0]?.["catalog-number"]; // TODO: support multi catalogs
        const releaseDate = albumData.date;
        const albumArtistCredit = albumData["artist-credit"];
        const edition = albumData.disambiguation;
        const albumArtists = await this.convertArtistCredits(albumArtistCredit, releaseDate);
        const discs = albumData.media;
        const result: Omit<ParsedAlbumData, "album_id"> = {
            title,
            catalog,
            date: releaseDate,
            edition,
            artist: albumArtists,
            type: "normal",
            discs: [],
        };
        let counter = 0;
        for (const disc of discs) {
            const tracks = disc.tracks;
            const parsedTracks: ParsedTrackData[] = [];
            for (const track of tracks) {
                const trackTitle = track.title;
                const trackArtistCredit = track["artist-credit"];
                const trackRecodingArtistCredit = track.recording?.["artist-credit"];
                const chosenArtistCredit =
                    trackArtistCredit.length >= trackRecodingArtistCredit.length
                        ? trackArtistCredit
                        : trackRecodingArtistCredit; // TODO: cover songs
                const trackArtists = await this.convertArtistCredits(chosenArtistCredit, releaseDate);
                parsedTracks.push({
                    title: trackTitle,
                    type:
                        guessTrackType(trackTitle, trackArtists) === "normal"
                            ? ""
                            : guessTrackType(trackTitle, trackArtists),
                    artist: stringifyArtists(trackArtists) === "[dialogue]" ? albumArtists : trackArtists,
                });
            }
            result.discs.push({
                tracks: parsedTracks,
                catalog:
                    albumData["label-info"]?.[counter]?.["catalog-number"] ||
                    albumData["label-info"]?.[0]?.["catalog-number"],
            });
            counter++;
        }
        console.log(result);
        return result;
    }
    private async convertArtistCredits(artistCredits: any[], releaseDate: string): Promise<MiniArtistItem[]> {
        const parsedArtists = Array.from(artistCredits, (item) => {
            return {
                name: item.artist.name,
                type: item.artist.type,
                id: item.artist.id,
            };
        });
        // const groups = parsedArtists.filter((artist) => artist.type === "Group");
        const persons = parsedArtists.filter((artist) => artist.type === "Person");
        const characters = parsedArtists.filter((artist) => artist.type === "Character");
        const result: (MiniArtistItem & { isGroup?: boolean })[] = [];
        const usedPersonIds: string[] = [];
        for (const artist of parsedArtists) {
            // 形如组合名（AAA，BBB）形式，非组合类型项应加入最后一个组合中
            const pushTarget = result[result.length - 1]?.children ? result[result.length - 1].children : result;
            if (artist.type === "Group") {
                result.push({
                    id: artist.id,
                    name: artist.name,
                    children: [],
                    isGroup: true,
                });
            } else if (artist.type === "Character") {
                let correspondingPerson: MiniArtistItem | null = null;
                if (this.characterPersonMap.has(artist.name)) {
                    correspondingPerson = this.characterPersonMap.get(artist.name) as MiniArtistItem;
                } else if (persons.length === characters.length) {
                    // 形如 AAA（CV. BBB）、CCC）（CV. DDD）形式 人物数量与角色数量相等
                    // 对应index的人物大概率即为角色声优
                    const charaIndex = characters.findIndex((chara) => chara.name === artist.name);
                    correspondingPerson = {
                        ...persons[charaIndex],
                        children: [],
                    };
                    this.characterPersonMap.set(artist.name, correspondingPerson);
                } else {
                    Logger.debug(
                        `[MusicBrainz] Try getting character voice from MusicBrainz, characterName: ${artist.name}`
                    );
                    // 无法从现有信息推断 尝试从API获得
                    const person = await this.getVoiceActorForCharacter(artist.id);
                    if (person) {
                        Logger.debug(
                            `[MusicBrainz] Got character voice info, characterName: ${artist.name}, cv: ${person.name}`
                        );
                        correspondingPerson = {
                            ...person,
                            children: [],
                        };
                        usedPersonIds.push(person.id);
                        this.characterPersonMap.set(artist.name, correspondingPerson);
                    } else {
                        Logger.warning(
                            `[MusicBrainz] Failed to get character voice info, characterName: ${artist.name}`
                        );
                    }
                }
                if (correspondingPerson) {
                    pushTarget.push({
                        id: artist.id,
                        name: artist.name,
                        children: [
                            {
                                id: correspondingPerson.id,
                                name: correspondingPerson.name,
                                children: [],
                            },
                        ],
                    });
                } else {
                    pushTarget.push({
                        id: artist.id,
                        name: artist.name,
                        children: [],
                    });
                }
            } else if (artist.type === "Person" && !usedPersonIds.includes(artist.id)) {
                pushTarget.push({
                    id: artist.id,
                    name: artist.name,
                    children: [],
                });
            } else if (artist.type === "Other") {
                pushTarget.push({
                    id: artist.id,
                    name: artist.name,
                    children: [],
                });
            }
        }

        const noMemberGroups = result.filter((i) => i.isGroup && i.children?.length === 0);
        // 补充组合成员
        for (const group of noMemberGroups) {
            if (this.groupGroupMemberMap.has(group.name)) {
                group.children = this.groupGroupMemberMap.get(group.name) as MiniArtistItem[];
                continue;
            }
            Logger.debug(`[MusicBrainz] Getting group members, groupName: ${group.name}`);
            const members = await this.getGroupMembers(group.id, releaseDate);
            Logger.debug(`[MusicBrainz] Got group members, groupMembers: ${members.map((m) => m.name)}`);
            for (const member of members) {
                if (member.type === "Character") {
                    if (this.characterPersonMap.has(member.name)) {
                        group.children.push({
                            id: member.id,
                            name: this.characterPersonMap.get(member.name)!.name,
                            children: [],
                        });
                    } else {
                        Logger.debug(
                            `[MusicBrainz] Try getting character voice from MusicBrainz, characterName: ${member.name}`
                        );
                        const person = await this.getVoiceActorForCharacter(member.id);
                        if (person) {
                            Logger.debug(
                                `[MusicBrainz] Got character voice info, characterName: ${member.name}, cv: ${person.name}`
                            );
                            group.children.push({
                                id: member.id,
                                name: member.name,
                                children: [
                                    {
                                        id: person.id,
                                        name: person.name,
                                        children: [],
                                    },
                                ],
                            });
                            this.characterPersonMap.set(member.name, {
                                ...person,
                                children: [],
                            });
                        } else {
                            Logger.warning(
                                `[MusicBrainz] Failed to get character voice info, characterName: ${member.name}`
                            );
                        }
                    }
                } else {
                    group.children.push({
                        id: member.id,
                        name: member.name,
                        children: [],
                    });
                }
            }
            this.groupGroupMemberMap.set(group.name, group.children);
        }

        return result;
    }
    private async getVoiceActorForCharacter(characterId: string) {
        const API = `https://musicbrainz.org/ws/2/artist/${characterId}?fmt=json&inc=artist-rels`;
        const groupData = await axios.get(API).then((res) => res.data);
        await sleep(1500); // API Rate Limit
        const relations = groupData.relations || [];
        const memberRelations = relations.filter((relation: any) => relation["type-id"] === RelationTypes.VoiceActor);
        if (memberRelations.length === 0) {
            return null;
        }
        return {
            id: memberRelations[0].artist.id,
            name: memberRelations[0].artist.name,
        };
    }
    async getGroupMembers(groupId: string, date: string): Promise<any[]> {
        const API = `https://musicbrainz.org/ws/2/artist/${groupId}?fmt=json&inc=artist-rels`;
        const groupData = await axios.get(API).then((res) => res.data);
        await sleep(1500); // API Rate Limit
        const relations = groupData.relations || [];
        const memberRelations = relations
            .filter((relation: any) => relation["type-id"] === RelationTypes.MemberOfGroup)
            .filter((relation: any) => {
                if (!date) {
                    return true;
                }
                const begin = dayjs(relation.begin);
                const end = dayjs(relation.end);
                const releaseDate = dayjs(date);
                if (begin.isValid() && end.isValid()) {
                    if (begin.isBefore(releaseDate) && end.isAfter(releaseDate)) {
                        return true;
                    } else {
                        Logger.debug(
                            `[MusicBrainz] Ignoring ${
                                relation.artist.name
                            }, cause it's not in the group when release date is ${releaseDate.format("YYYY-MM-DD")}`
                        );
                        return false;
                    }
                } else if (begin.isValid()) {
                    if (begin.isBefore(releaseDate)) {
                        return true;
                    } else {
                        Logger.debug(
                            `[MusicBrainz] Ignoring ${
                                relation.artist.name
                            }, cause it's not in the group when release date is ${releaseDate.format("YYYY-MM-DD")}`
                        );
                        return false;
                    }
                } else {
                    return true;
                }
            });
        return memberRelations.map((relation: any) => ({
            id: relation.artist.id,
            name: relation.artist.name,
            type: relation.artist.type,
        }));
    }
}

export default new MusicBrainzScraper();
