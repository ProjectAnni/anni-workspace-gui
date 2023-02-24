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
