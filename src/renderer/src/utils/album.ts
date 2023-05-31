import { pick, sortBy, throttle } from "lodash";
import {
    AlbumData,
    Artist,
    DiscData,
    ParsedAlbumData,
    ParsedDiscData,
    ParsedTrackData,
    TrackData,
} from "@/types/album";
import { parseArtists, parseTags, stringifyArtists, stringifyTags } from "./helper";

const isArtistsEqual = (artists1?: Artist[], artists2?: Artist[]): boolean => {
    if ((artists1 && !artists2) || (!artists1 && artists2)) {
        return false;
    }
    const sortedArtists1 = sortBy(artists1, "name");
    const sortedArtists2 = sortBy(artists2, "name");
    sortedArtists1.forEach((artist) => {
        artist.children = sortBy(artist.children, "name");
    });
    sortedArtists2.forEach((artist) => {
        artist.children = sortBy(artist.children, "name");
    });
    return stringifyArtists(sortedArtists1) === stringifyArtists(sortedArtists2);
};

export const parseAlbumData = (content: AlbumData): ParsedAlbumData => {
    const parsedAlbum: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "title", "type", "edition"),
        ...(content.tags ? { tags: parseTags(content.tags) } : {}),
        ...(content.artist ? { artist: parseArtists(content.artist) } : { artist: [] }),
        discs: [],
    };
    for (const disc of content.discs) {
        const parsedDisc: ParsedDiscData = {
            ...pick(disc, "title", "catalog", "type"),
            ...(disc.tags ? { tags: parseTags(disc.tags) } : {}),
            ...(disc.artist ? { artist: parseArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const parsedTrack: ParsedTrackData = {
                ...pick(track, "title", "type"),
                ...(track.tags ? { tags: parseTags(track.tags) } : {}),
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

export const unparseAlbumData = (content: ParsedAlbumData): AlbumData => {
    const albumData: AlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "title", "type"),
        ...(content.edition ? { edition: content.edition } : {}),
        ...(content.tags ? { tags: stringifyTags(content.tags) } : { tags: [] }),
        ...(content.artist ? { artist: stringifyArtists(content.artist) } : { artist: "" }),
        discs: [],
    };
    for (const disc of content.discs) {
        const discData: DiscData = {
            ...pick(disc, "catalog"),
            ...(disc.title ? { title: disc.title } : {}),
            ...(disc.type ? { type: disc.type } : {}),
            ...(disc.tags ? { tags: stringifyTags(disc.tags) } : {}),
            ...(disc.artist?.length ? { artist: stringifyArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const trackData: TrackData = {
                ...pick(track, "title"),
                ...(track.type ? { type: track.type } : {}),
                ...(track.tags ? { tags: stringifyTags(track.tags) } : {}),
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
    return albumData;
};

/** 简化AlbumData - 去除track与disc类型重复等问题 */
export const simplifyAlbumData = (content: ParsedAlbumData): ParsedAlbumData => {
    const albumData: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "title", "type"),
        ...(content.edition ? { edition: content.edition } : {}),
        ...(content.tags ? { tags: content.tags } : { tags: [] }),
        ...(content.artist ? { artist: content.artist } : { artist: [] }),
        discs: [],
    };
    for (const disc of content.discs) {
        const discData: ParsedDiscData = {
            ...pick(disc, "catalog"),
            ...(disc.title ? { title: disc.title } : {}),
            ...(disc.type && disc.type !== albumData.type ? { type: disc.type } : {}),
            ...(disc.tags ? { tags: disc.tags } : {}),
            ...(disc.artist?.length && !isArtistsEqual(disc.artist, albumData.artist) ? { artist: disc.artist } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const shouldUseTrackArtist =
                track.artist?.length &&
                // track 与 disc 艺术家一致则忽略
                !isArtistsEqual(track.artist, disc.artist) &&
                !(
                    // track 与 album 艺术家一致且 disc 无艺术家则忽略
                    (!disc.artist?.length && isArtistsEqual(track.artist, albumData.artist))
                );
            const trackData: ParsedTrackData = {
                ...pick(track, "title"),
                ...(track.type && track.type !== disc.type ? { type: track.type } : {}),
                ...(track.tags ? { tags: track.tags } : {}),
                ...(shouldUseTrackArtist
                    ? {
                          artist: track.artist,
                      }
                    : {}),
            };
            discData.tracks.push(trackData);
        }
        albumData.discs.push(discData);
    }
    return albumData;
};

export const readAlbumFile = async (path: string): Promise<ParsedAlbumData> => {
    const content: AlbumData = await window.__anni_bridge.readAlbumFile(path);
    return parseAlbumData(content);
};

export const writeAlbumFile = async (content: ParsedAlbumData, path: string) => {
    const albumData = unparseAlbumData(content);
    return await window.__anni_bridge.writeAlbumFile(path, JSON.stringify(albumData));
};

export const getAlbumFileWriter = () => {
    return throttle(writeAlbumFile, 2000);
};
