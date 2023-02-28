import { atom } from "jotai";
import { fs } from "@tauri-apps/api";
import { WorkspaceRepoTagBasePathAtom } from "../../state";

export const TagDirectoryContentAtom = atom(async (get) => {
    const tagPath = get(WorkspaceRepoTagBasePathAtom);
    const dir = await fs.readDir(tagPath);
    return dir
        .filter((entry) => !entry.children && entry.name && entry.path)
        .map((entry) => ({ label: entry.name || "", path: entry.path }));
});
