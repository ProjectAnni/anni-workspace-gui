import { pick, throttle } from "lodash";
import { invoke, fs, path } from "@tauri-apps/api";
import { AlbumData, DiscData, ParsedAlbumData, ParsedDiscData, ParsedTrackData, TrackData } from "@/types/album";
import { parseArtists, stringifyArtists } from "./helper";

export const readAlbumFile = async (path: string): Promise<ParsedAlbumData> => {
    const content = (await invoke("read_album_file", {
        path,
    })) as AlbumData;
    const parsedAlbum: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "tags", "title", "type", "edition"),
        ...(content.artist ? { artist: parseArtists(content.artist) } : { artist: [] }),
        discs: [],
    };
    for (const disc of content.discs) {
        const parsedDisc: ParsedDiscData = {
            ...pick(disc, "title", "catalog", "type"),
            ...(disc.artist ? { artist: parseArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const parsedTrack: ParsedTrackData = {
                ...pick(track, "title", "type"),
                ...(track.artist
                    ? {
                          artist: parseArtists(track.artist),
                      }
                    : {}),
            };
            parsedDisc.tracks.push(parsedTrack);
        }
        parsedAlbum.discs.push(parsedDisc);
    }
    return parsedAlbum;
};

export const writeAlbumFile = throttle(async (content: ParsedAlbumData, path: string) => {
    const albumData: AlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "title", "type"),
        ...(content.edition ? { edition: content.edition } : {}),
        ...(content.tags ? { tags: content.tags } : { tags: [] }),
        ...(content.artist ? { artist: stringifyArtists(content.artist) } : { artist: "" }),
        discs: [],
    };
    for (const disc of content.discs) {
        const discData: DiscData = {
            ...pick(disc, "catalog"),
            ...(disc.title ? { title: disc.title } : {}),
            ...(disc.type ? { type: disc.type } : {}),
            ...(disc.artist?.length ? { artist: stringifyArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const trackData: TrackData = {
                ...pick(track, "title"),
                ...(track.type ? { type: track.type } : {}),
                ...(track.artist?.length
                    ? {
                          artist: stringifyArtists(track.artist),
                      }
                    : {}),
            };
            discData.tracks.push(trackData);
        }
        albumData.discs.push(discData);
    }
    await invoke("write_album_file", {
        path,
        albumJsonStr: JSON.stringify(albumData),
    });
}, 2000);

export const readAlbumCover = async (baseDirectory: string) => {
    // 存在优先级
    const alternativeCoverFilenames = [
        "cover.jpg",
        "Cover.jpg",
        "cover.jpeg",
        "Cover.jpeg",
        "cover.png",
        "Cover.png",
        "folder.jpg",
        "folder.png",
    ];
    for (const filename of alternativeCoverFilenames) {
        const coverPath = await path.resolve(baseDirectory, filename);
        if (await fs.exists(coverPath)) {
            return [await fs.readBinaryFile(coverPath), coverPath] as const;
        }
    }
    return null;
};

export const writeAlbumCover = async (baseDirectory: string, coverData: Uint8Array) => {
    const dir = await fs.readDir(baseDirectory);
    const hasMultiDiscs = dir.some((entry) => !!entry.children);
    if (!hasMultiDiscs) {
        await fs.writeBinaryFile(await path.resolve(baseDirectory, "cover.jpg"), coverData);
    } else {
        const discEntries = dir.filter((entry) => !!entry.children);
        for (const discEntry of discEntries) {
            await fs.writeBinaryFile(await path.resolve(discEntry.path, "cover.jpg"), coverData);
        }
    }
};
