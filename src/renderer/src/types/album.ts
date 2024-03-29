import { ParsedTag } from "./tag";

export interface AlbumData {
    album_id: string;
    artist?: string;
    catalog?: string;
    date?: string;
    tags?: string[];
    title?: string;
    type?: string;
    edition?: string;
    discs: DiscData[];
}

export interface DiscData {
    catalog: string;
    title?: string;
    artist?: string;
    type?: string;
    tags?: string[];
    tracks: TrackData[];
}

export interface TrackData {
    title: string;
    artist?: string;
    type?: string;
    tags?: string[];
}

export interface ParsedAlbumData {
    album_id: string;
    artist?: Artist[];
    catalog?: string;
    date?: string;
    tags?: ParsedTag[];
    title?: string;
    type?: string;
    edition?: string;
    discs: ParsedDiscData[];
}

export interface ParsedDiscData {
    catalog: string;
    title?: string;
    artist?: Artist[];
    type?: string;
    tags?: ParsedTag[];
    tracks: ParsedTrackData[];
}

export interface ParsedTrackData {
    title: string;
    artist?: Artist[];
    type?: string;
    tags?: ParsedTag[];
}

export interface Artist {
    name: string;
    children: Artist[];
}
