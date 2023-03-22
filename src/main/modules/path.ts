import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as path from "path";

class PathModule {
    listen() {
        ipcMain.handle("path:resolve", this.resolve);
        ipcMain.handle("path:basename", this.basename);
        ipcMain.handle("path:extname", this.extname);
    }

    resolve(e: IpcMainInvokeEvent, ...args: string[]) {
        return path.resolve(...args);
    }

    basename(e: IpcMainInvokeEvent, filePath: string, ext?: string) {
        return path.basename(filePath, ext);
    }

    extname(e: IpcMainInvokeEvent, filePath: string) {
        return path.extname(filePath);
    }
}

export default PathModule;
