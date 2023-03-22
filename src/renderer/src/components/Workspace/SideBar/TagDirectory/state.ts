import { atom } from "jotai";
import { WorkspaceRepoTagBasePathAtom } from "../../state";

export const TagDirectoryContentAtom = atom(async (get) => {
    const tagPath = await get(WorkspaceRepoTagBasePathAtom);
    const dir = await window.__native_bridge.fs.readDir(tagPath);
    const result: { label: string; path: string }[] = [];
    for (const entry of dir.filter((e) => !e.isDirectory)) {
        result.push({
            label: entry.name,
            path: await window.__native_bridge.path.resolve(tagPath, entry.name),
        });
    }
    return result;
});
