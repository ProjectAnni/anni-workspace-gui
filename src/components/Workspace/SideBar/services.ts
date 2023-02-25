import { invoke } from "@tauri-apps/api";
import { processTauriError } from "@/utils/error";
import Logger from "@/utils/log";
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

export async function publishAlbum(workspacePath: string, albumPath: string) {
    Logger.info(`Publish album, workspacePath: ${workspacePath}, albumPath: ${albumPath}`);
    try {
        return await invoke<WorkspaceAlbum[]>("publish_album", {
            workspacePath,
            albumPath,
        });
    } catch (e) {
        throw processTauriError(e);
    }
}
