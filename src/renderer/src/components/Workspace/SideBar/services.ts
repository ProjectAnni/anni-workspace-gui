import Logger from "@/utils/log";

export async function getWorkspaceAlbums(workspacePath: string) {
    return await window.__anni_bridge.getWorkspaceAlbums(workspacePath);
}

export async function publishAlbum(workspacePath: string, albumPath: string) {
    Logger.info(`Publish album, workspacePath: ${workspacePath}, albumPath: ${albumPath}`);
    return await window.__anni_bridge.publishAlbum(workspacePath, albumPath);
}
