import { LocalDate } from "@ltd/j-toml";

export interface AlbumData {
    album: AlbumMetaInfo;
    discs: DiscData[];
}

export interface AlbumMetaInfo {
    album_id: string;
    artist: string;
    catalog: string;
    date: LocalDate;
    tags: string[];
    title: string;
    type: string;
}

export interface DiscData {
    title?: string;
    catalog: string;
    tracks: TrackData;
}

export interface TrackData {
    title: string;
    artist: string;
    type?: string;
}
