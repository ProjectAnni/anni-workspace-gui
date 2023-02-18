import { invoke, fs, path } from "@tauri-apps/api";
import { processTauriError } from "@/utils/error";
import { WorkspaceAlbum } from "../types";

export async function getWorkspaceAlbums(workspacePath: string) {
    try {
        return await invoke<WorkspaceAlbum[]>("get_workspace_albums", {
            workspacePath,
        });
    } catch (e) {
        throw processTauriError(e);
    }
}

export async function searchFile(basePath: string | string[], filename: string) {
    const searchPaths = [...(Array.isArray(basePath) ? basePath : [basePath])];
    for (const searchPath of searchPaths) {
        const entries = await fs.readDir(searchPath, { recursive: true });
        const result = entries.find((entry) => entry.name === filename);
        if (result) {
            return result.path;
        }
    }
}
