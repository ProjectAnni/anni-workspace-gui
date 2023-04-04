import type { OpenDialogSyncOptions } from "electron";
import type { Dirent } from "fs";
import { WorkspaceAlbum, WorkspaceDisc } from "./components/Workspace/types";
import { AlbumData } from "./types/album";

declare global {
    interface Window {
        __anni_bridge: {
            readAlbumFile: (albumPath: string) => Promise<AlbumData>;
            writeAlbumFile: (albumPath: string, albumJsonStr: string) => Promise<void>;
            getWorkspaceAlbums: (workspacePath: string) => Promise<WorkspaceAlbum[]>;
            createAlbum: (workspacePath: string, albumPath: string, discNum: number) => Promise<void>;
            commitAlbumPrepare: (workspacePath: string, albumPath: string) => Promise<WorkspaceDisc[]>;
            commitAlbum: (workspacePath: string, albumPath: string) => Promise<void>;
            publishAlbum: (workspacePath: string, albumPath: string) => Promise<void>;
        };
        __native_bridge: {
            fs: {
                readTextFile: (filePath: string) => Promise<string>;
                readBinaryFile: (filePath: string) => Promise<Uint8Array>;
                writeFile: (filePath: string, content: string | Uint8Array) => Promise<void>;
                exists: (filePath: string) => Promise<boolean>;
                readDir: (directoryPath: string) => Promise<(Dirent & { isDirectory: boolean })[]>;
                rename: (oldPath: string, newPath: string) => Promise<void>;
                copyFile: (sourcePath: string, targetPath: string) => Promise<void>;
                createDir: (newPath: string) => Promise<void>;
                deleteDirectory: (directoryPath: string) => Promise<void>;
            };
            path: {
                resolve: (...args: string[]) => Promise<string>;
                basename: (filePath: string, ext?: string) => Promise<string>;
                extname: (filePath: string) => Promise<string>;
            };
            dialog: {
                open: (options: OpenDialogSyncOptions) => Promise<string[] | undefined>;
            };
            events: {
                onWorkspaceStatusChange: (callback) => () => void;
            };
        };
    }
}
