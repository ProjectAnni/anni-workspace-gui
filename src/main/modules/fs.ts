import { ipcMain, IpcMainInvokeEvent } from "electron";
import * as fs from "fs";
import * as path from "path";

class FileModule {
    listen() {
        ipcMain.handle("file:readTextFile", this.readTextFile);
        ipcMain.handle("file:readBinaryFile", this.readBinaryFile);
        ipcMain.handle("file:writeFile", this.writeFile);
        ipcMain.handle("file:exists", this.exists);
        ipcMain.handle("file:readDir", this.readDir);
        ipcMain.handle("file:rename", this.rename);
        ipcMain.handle("file:copyFile", this.copyFile);
        ipcMain.handle("file:createDir", this.createDir);
        ipcMain.handle("file:deleteDirectory", this.deleteDirectory);
        ipcMain.handle("file:deleteFile", this.deleteFile);
    }

    readTextFile(e: IpcMainInvokeEvent, filePath: string) {
        return fs.readFileSync(path.resolve(filePath)).toString();
    }

    readBinaryFile(e: IpcMainInvokeEvent, filePath: string) {
        return new Uint8Array(fs.readFileSync(path.resolve(filePath)));
    }

    writeFile(e: IpcMainInvokeEvent, filePath: string, content: string | Uint8Array) {
        return fs.writeFileSync(path.resolve(filePath), content);
    }

    exists(e: IpcMainInvokeEvent, filePath: string) {
        return fs.existsSync(filePath);
    }

    readDir(e: IpcMainInvokeEvent, directoryPath: string) {
        return fs.readdirSync(directoryPath, { withFileTypes: true }).map((entry) => ({
            ...entry,
            isDirectory: entry.isDirectory(),
        }));
    }

    rename(e: IpcMainInvokeEvent, oldPath: string, newPath: string) {
        return fs.renameSync(oldPath, newPath);
    }

    copyFile(e: IpcMainInvokeEvent, sourcePath: string, targetPath: string) {
        return fs.copyFileSync(sourcePath, targetPath);
    }

    createDir(e: IpcMainInvokeEvent, newPath: string) {
        return fs.mkdirSync(newPath);
    }

    static _deleteDirectory = (directoryPath: string) => {
        const dir = fs.readdirSync(directoryPath, { withFileTypes: true });
        for (const entry of dir) {
            const entryPath = path.resolve(directoryPath, entry.name);
            if (entry.isDirectory()) {
                FileModule._deleteDirectory(entryPath);
            } else {
                fs.unlinkSync(entryPath);
            }
        }
        fs.rmdirSync(directoryPath);
    };

    deleteDirectory(e: IpcMainInvokeEvent, directoryPath: string) {
        return FileModule._deleteDirectory(directoryPath);
    }

    deleteFile(e: IpcMainInvokeEvent, filePath: string) {
        return fs.unlinkSync(filePath);
    }
}

export default FileModule;
