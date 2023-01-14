export interface AlbumData {
    album_id: string;
    artist: string;
    catalog: string;
    date: string;
    tags: string[];
    title: string;
    type: string;
    discs: DiscData[];
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
