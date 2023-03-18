import { pick, sortBy, throttle } from "lodash";
import { invoke } from "@tauri-apps/api";
import {
    AlbumData,
    Artist,
    DiscData,
    ParsedAlbumData,
    ParsedDiscData,
    ParsedTrackData,
    TrackData,
} from "@/types/album";
import { parseArtists, stringifyArtists } from "./helper";
import { processTauriError } from "./error";

const isArtistsEqual = (artists1?: Artist[], artists2?: Artist[]): boolean => {
    if ((artists1 && !artists2) || (!artists1 && artists2)) {
        return false;
    }
    const sortedArtists1 = sortBy(artists1, "name");
    const sortedArtists2 = sortBy(artists2, "name");
    return stringifyArtists(sortedArtists1) === stringifyArtists(sortedArtists2);
};

export const parseAlbumData = (content: AlbumData): ParsedAlbumData => {
    const parsedAlbum: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "tags", "title", "type", "edition"),
        ...(content.artist ? { artist: parseArtists(content.artist) } : { artist: [] }),
        discs: [],
    };
    for (const disc of content.discs) {
        const parsedDisc: ParsedDiscData = {
            ...pick(disc, "title", "catalog", "type", "tags"),
            ...(disc.artist ? { artist: parseArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const parsedTrack: ParsedTrackData = {
                ...pick(track, "title", "type", "tags"),
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
        ...(content.tags ? { tags: content.tags } : { tags: [] }),
        ...(content.artist ? { artist: stringifyArtists(content.artist) } : { artist: "" }),
        discs: [],
    };
    for (const disc of content.discs) {
        const discData: DiscData = {
            ...pick(disc, "catalog"),
            ...(disc.title ? { title: disc.title } : {}),
            ...(disc.type ? { type: disc.type } : {}),
            ...(disc.tags ? { tags: disc.tags } : {}),
            ...(disc.artist?.length ? { artist: stringifyArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const trackData: TrackData = {
                ...pick(track, "title"),
                ...(track.type ? { type: track.type } : {}),
                ...(track.tags ? { tags: track.tags } : {}),
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
            const trackData: ParsedTrackData = {
                ...pick(track, "title"),
                ...(track.type && track.type !== disc.type ? { type: track.type } : {}),
                ...(track.tags ? { tags: track.tags } : {}),
                ...(track.artist?.length && isArtistsEqual(track.artist, disc.artist)
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
    let content: AlbumData;
    try {
        content = (await invoke("read_album_file", {
            path,
        })) as AlbumData;
    } catch (e) {
        throw processTauriError(e);
    }

    return parseAlbumData(content);
};

export const writeAlbumFile = async (content: ParsedAlbumData, path: string) => {
    const albumData = unparseAlbumData(content);
    try {
        await invoke("write_album_file", {
            path,
            albumJsonStr: JSON.stringify(albumData),
        });
    } catch (e) {
        throw processTauriError(e);
    }
};

export const serializeAlbumData = async (content: ParsedAlbumData): Promise<string> => {
    const albumData = unparseAlbumData(content);
    try {
        return await invoke("serialize_album", {
            albumJsonStr: JSON.stringify(albumData),
        });
    } catch (e) {
        throw processTauriError(e);
    }
};

export const getAlbumFileWriter = () => {
    return throttle(writeAlbumFile, 2000);
};
