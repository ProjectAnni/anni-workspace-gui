export enum WorkspaceState {
    UNTRACKED = "untracked",
    COMMITTED = "committed",
    PUBLISHED = "published",
    DANGLING = "dangling",
    GARBAGE = "garbage",
}

export interface WorkspaceAlbum {
    album_id: string;
    path: string;
    type: WorkspaceState;
}

export interface WorkspaceDisc {
    index: number;
    path: string;
    cover: string;
    tracks: string[];
}
