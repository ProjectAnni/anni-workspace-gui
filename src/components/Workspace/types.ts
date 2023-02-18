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
