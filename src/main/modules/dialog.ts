import { BrowserWindow, dialog, ipcMain, IpcMainInvokeEvent, OpenDialogSyncOptions } from "electron";

class PathModule {
    listen() {
        ipcMain.handle("dialog:open", this.open);
    }

    open(e: IpcMainInvokeEvent, options: OpenDialogSyncOptions) {
        const { sender } = e;
        const browserWindow = BrowserWindow.fromWebContents(sender);
        if (!browserWindow) {
            return;
        }
        return dialog.showOpenDialogSync(browserWindow, options);
    }
}

export default PathModule;
