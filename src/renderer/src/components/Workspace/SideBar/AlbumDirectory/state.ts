import { atom } from "jotai";
import { WorkspaceRepoConfigAtom } from "../../state";
import { AlbumDirectory, readAlbumDir } from "./utils";

export const AlbumDirectoriesContentAtom = atom(async (get) => {
    const repoConfig = await get(WorkspaceRepoConfigAtom);
    const { albumPaths } = repoConfig || {};
    if (!albumPaths?.length) {
        return [];
    }
    const albumDirs: AlbumDirectory[] = [];
    for (const albumPath of albumPaths) {
        albumDirs.push(await readAlbumDir(albumPath));
    }
    return albumDirs;
});
