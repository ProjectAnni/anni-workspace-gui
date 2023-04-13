import { contextBridge, ipcRenderer } from "electron";
// import { electronAPI } from "@electron-toolkit/preload";

contextBridge.exposeInMainWorld("__anni_bridge", {
    readAlbumFile: (...args) => ipcRenderer.invoke("anni:readAlbumFile", ...args),
    writeAlbumFile: (...args) => ipcRenderer.invoke("anni:writeAlbumFile", ...args),
    getWorkspaceAlbums: (...args) => ipcRenderer.invoke("anni:getWorkspaceAlbums", ...args),
    createAlbum: (...args) => ipcRenderer.invoke("anni:createAlbum", ...args),
    commitAlbumPrepare: (...args) => ipcRenderer.invoke("anni:commitAlbumPrepare", ...args),
    commitAlbum: (...args) => ipcRenderer.invoke("anni:commitAlbum", ...args),
    publishAlbum: (...args) => ipcRenderer.invoke("anni:publishAlbum", ...args),
});

contextBridge.exposeInMainWorld("__native_bridge", {
    fs: {
        readTextFile: (...args) => ipcRenderer.invoke("file:readTextFile", ...args),
        readBinaryFile: (...args) => ipcRenderer.invoke("file:readBinaryFile", ...args),
        writeFile: (...args) => ipcRenderer.invoke("file:writeFile", ...args),
        exists: (...args) => ipcRenderer.invoke("file:exists", ...args),
        readDir: (...args) => ipcRenderer.invoke("file:readDir", ...args),
        rename: (...args) => ipcRenderer.invoke("file:rename", ...args),
        copyFile: (...args) => ipcRenderer.invoke("file:copyFile", ...args),
        createDir: (...args) => ipcRenderer.invoke("file:createDir", ...args),
        deleteDirectory: (...args) => ipcRenderer.invoke("file:deleteDirectory", ...args),
        deleteFile: (...args) => ipcRenderer.invoke("file:deleteFile", ...args),
    },
    path: {
        resolve: (...args) => ipcRenderer.invoke("path:resolve", ...args),
        basename: (...args) => ipcRenderer.invoke("path:basename", ...args),
        extname: (...args) => ipcRenderer.invoke("path:extname", ...args),
    },
    dialog: {
        open: (...args) => ipcRenderer.invoke("dialog:open", ...args),
    },
    events: {
        onWorkspaceStatusChange: (callback) => {
            ipcRenderer.on("workspace_status_change", () => {
                callback();
            });
            return () => {
                ipcRenderer.removeListener("workspace_status_change", callback);
            };
        },
    },
});
