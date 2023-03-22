import { ipcMain, IpcMainInvokeEvent } from "electron";
const Anni = require("anni-javascript-binding");

class AnniRustModule {
    listen() {
        ipcMain.handle("anni:readAlbumFile", this.readAlbumFile);
        ipcMain.handle("anni:writeAlbumFile", this.writeAlbumFile);
        ipcMain.handle("anni:getWorkspaceAlbums", this.getWorkspaceAlbums);
        ipcMain.handle("anni:createAlbum", this.createAlbum);
        ipcMain.handle("anni:commitAlbumPrepare", this.commitAlbumPrepare);
        ipcMain.handle("anni:commitAlbum", this.commitAlbum);
        ipcMain.handle("anni:publishAlbum", this.publishAlbum);
    }

    readAlbumFile(e: IpcMainInvokeEvent, albumFilePath: string) {
        return Anni.readAlbumFile(albumFilePath);
    }

    writeAlbumFile(e: IpcMainInvokeEvent, albumFilePath: string, albumJsonStr: string): void {
        return Anni.writeAlbumFile(albumFilePath, albumJsonStr);
    }

    getWorkspaceAlbums(e: IpcMainInvokeEvent, workspacePath: string): unknown {
        return Anni.getWorkspaceAlbums(workspacePath);
    }

    createAlbum(e: IpcMainInvokeEvent, workspacePath: string, albumPath: string, discNum: number): void {
        return Anni.createAlbum(workspacePath, albumPath, discNum);
    }

    commitAlbumPrepare(e: IpcMainInvokeEvent, workspacePath: string, albumPath: string): unknown {
        return Anni.commitAlbumPrepare(workspacePath, albumPath);
    }

    commitAlbum(e: IpcMainInvokeEvent, workspacePath: string, albumPath: string): void {
        const result = Anni.commitAlbum(workspacePath, albumPath);
        ipcMain.emit("workspace_status_change");
        return result;
    }

    publishAlbum(e: IpcMainInvokeEvent, workspacePath: string, albumPath: string): void {
        const result = Anni.publishAlbum(workspacePath, albumPath);
        ipcMain.emit("workspace_status_change");
        return result;
    }
}

export default AnniRustModule;
