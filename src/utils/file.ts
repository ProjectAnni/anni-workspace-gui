import { pick, throttle } from "lodash";
import { invoke } from "@tauri-apps/api";
import {
    AlbumData,
    DiscData,
    ParsedAlbumData,
    ParsedDiscData,
    ParsedTrackData,
    TrackData,
} from "@/types/album";
import { parseArtists, stringifyArtists } from "./helper";

export const readAlbumFile = async (path: string): Promise<ParsedAlbumData> => {
    const content = (await invoke("read_album_file", {
        path,
    })) as AlbumData;
    const parsedAlbum: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "tags", "title", "type", "edition"),
        ...(content.artist ? { artist: parseArtists(content.artist) } : {}),
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

export const writeAlbumFile = throttle(
    async (content: ParsedAlbumData, path: string) => {
        const albumData: AlbumData = {
            album_id: content.album_id,
            ...pick(content, "catalog", "date", "tags", "title", "type", "edition"),
            ...(content.artist
                ? { artist: stringifyArtists(content.artist) }
                : {}),
            discs: [],
        };
        for (const disc of content.discs) {
            const discData: DiscData = {
                ...pick(disc, "title", "catalog", "type"),
                ...(disc.artist
                    ? { artist: stringifyArtists(disc.artist) }
                    : {}),
                tracks: [],
            };
            for (const track of disc.tracks) {
                const trackData: TrackData = {
                    ...pick(track, "title", "type"),
                    ...(track.artist
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
    },
    2000
);
