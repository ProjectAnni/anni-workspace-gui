import { atom } from "jotai";
import { WorkspaceRepoConfigAtom } from "../../state";
import { readAlbumDir } from "./utils";

export const AlbumDirectoriesAtom = atom(async (get) => {
    const repoConfig = get(WorkspaceRepoConfigAtom);
    const { albumPaths } = repoConfig || {};
    if (!albumPaths?.length) {
        return [];
    }
    const albumDirs = [];
    for (const albumPath of albumPaths) {
        albumDirs.push(await readAlbumDir(albumPath));
    }
    return albumDirs;
});
