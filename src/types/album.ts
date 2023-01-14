import { Artist } from "@/utils/helper";

export interface AlbumData {
    album_id: string;
    artist?: string;
    catalog?: string;
    date?: string;
    tags?: string[];
    title?: string;
    type?: string;
    discs: DiscData[];
}

export interface DiscData {
    catalog: string;
    title?: string;
    artist?: string;
    type?: string;
    tracks: TrackData[];
}

export interface TrackData {
    title: string;
    artist?: string;
    type?: string;
}

export interface ParsedAlbumData {
    album_id: string;
    artist?: Artist[];
    catalog?: string;
    date?: string;
    tags?: string[];
    title?: string;
    type?: string;
    discs: ParsedDiscData[];
}

export interface ParsedDiscData {
    catalog: string;
    title?: string;
    artist?: Artist[];
    type?: string;
    tracks: ParsedTrackData[];
}

export interface ParsedTrackData {
    title: string;
    artist?: Artist[];
    type?: string;
}