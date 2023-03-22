import axios from "axios";
import Logger from "@/utils/log";
import { parseCatalog } from "@/utils/helper";
import { WorkspaceDisc } from "../Workspace/types";

export interface CoverItem {
    id: string;
    thumbnailUrl: string;
    originUrl: string;
}

export const searchCoverFromITunes = async (keyword: string) => {
    const url = `https://itunes.apple.com/search?term=${keyword}&country=jp&media=music&entity=album`;
    const response = await axios.get<any>(url);
    const results = response.data?.results;
    const covers: CoverItem[] = [];
    for (const result of results) {
        const { collectionId, artworkUrl100 } = result;
        if (collectionId && artworkUrl100) {
            covers.push({
                id: collectionId,
                thumbnailUrl: artworkUrl100.replace("100x100", "250x250"),
                originUrl: artworkUrl100.replace("100x100", "10000x10000"),
            });
        }
    }
    return covers;
};

export const downloadCover = async (url: string) => {
    const response = await axios.get<Uint8Array>(url, {
        responseType: "arraybuffer",
    });
    return response.data;
};

export const readAlbumCover = async (baseDirectory: string) => {
    // 存在优先级
    const alternativeCoverFilenames = [
        "cover.jpg",
        "Cover.jpg",
        "cover.jpeg",
        "Cover.jpeg",
        "cover.png",
        "Cover.png",
        "folder.jpg",
        "folder.png",
    ];
    for (const filename of alternativeCoverFilenames) {
        const coverPath = await window.__native_bridge.path.resolve(baseDirectory, filename);
        if (await window.__native_bridge.fs.exists(coverPath)) {
            Logger.debug(`Found cover: ${coverPath}`);
            return [await window.__native_bridge.fs.readBinaryFile(coverPath), coverPath] as const;
        }
    }
    return null;
};

export const writeAlbumCover = async (baseDirectory: string, coverData: Uint8Array) => {
    Logger.debug(`Write cover: ${baseDirectory}`);
    const dir = await window.__native_bridge.fs.readDir(baseDirectory);
    const hasMultiDiscs = dir.some((entry) => entry.isDirectory);
    if (!hasMultiDiscs) {
        Logger.debug(
            `Write cover data: [binary] -> ${await window.__native_bridge.path.resolve(baseDirectory, "cover.jpg")}`
        );
        await window.__native_bridge.fs.writeFile(
            await window.__native_bridge.path.resolve(baseDirectory, "cover.jpg"),
            coverData
        );
    } else {
        const discEntries = dir.filter((entry) => entry.isDirectory);
        for (const discEntry of discEntries) {
            Logger.debug(
                `Write cover data: [binary] -> ${await window.__native_bridge.path.resolve(
                    baseDirectory,
                    discEntry.name,
                    "cover.jpg"
                )}`
            );
            await window.__native_bridge.fs.writeFile(
                await window.__native_bridge.path.resolve(baseDirectory, discEntry.name, "cover.jpg"),
                coverData
            );
        }
    }
};

interface AlbumBasicInfo {
    catalog: string;
    /** YYMMDD */
    date: string;
    title: string;
    edition?: string;
}

export const standardizeAlbumDirectoryName = async (originPath: string, albumInfo: AlbumBasicInfo) => {
    Logger.info("Standardize album directory name");
    const { date, title, catalog, edition } = albumInfo;
    const dir = await window.__native_bridge.fs.readDir(originPath);
    const discNum = dir.filter((entry) => entry.isDirectory).length;

    if (discNum === 1) {
        throw new Error("多Disc，但好像又没多");
    }

    const finalName = `[${date}][${catalog}] ${title}${edition ? `【${edition}】` : ""}${
        discNum > 1 ? ` [${discNum} Discs]` : ""
    }`;

    const newAlbumDirectoryPath = await window.__native_bridge.path.resolve(originPath, `../${finalName}`);

    if (await window.__native_bridge.fs.exists(newAlbumDirectoryPath)) {
        throw new Error("目标文件夹已存在");
    }

    Logger.debug(`Rename ${originPath} -> ${newAlbumDirectoryPath}`);
    // rename album directory
    await window.__native_bridge.fs.rename(originPath, newAlbumDirectoryPath);

    if (discNum > 1) {
        // rename disc folders
        const catalogs = parseCatalog(catalog);
        if (catalogs.length !== discNum) {
            throw new Error("碟片数量与品番不匹配");
        }
        const newDir = await window.__native_bridge.fs.readDir(newAlbumDirectoryPath);
        const discEntries = newDir.filter((entry) => entry.isDirectory).sort(); // 字典序排序
        let counter = 1;
        for (const discEntry of discEntries) {
            const originDiscDirectoryPath = await window.__native_bridge.path.resolve(
                newAlbumDirectoryPath,
                discEntry.name
            );
            const newDiscDirectoryName = `[${catalogs[counter - 1]}] ${title} [Disc ${counter}]`;
            const newDiscDirectoryPath = await window.__native_bridge.path.resolve(
                originDiscDirectoryPath,
                `../${newDiscDirectoryName}`
            );
            Logger.debug(`Rename ${originDiscDirectoryPath} -> ${newDiscDirectoryPath}`);
            await window.__native_bridge.fs.rename(originDiscDirectoryPath, newDiscDirectoryPath);
        }
    }

    return newAlbumDirectoryPath;
};

export const createWorkspaceAlbum = async (workspacePath: string, albumDirectoryPath: string) => {
    const dir = await window.__native_bridge.fs.readDir(albumDirectoryPath);
    const discNum = dir.filter((entry) => entry.isDirectory).length;
    Logger.debug(`Create workspace album, workspace: ${workspacePath}, album: ${albumDirectoryPath}`);
    return await window.__anni_bridge.createAlbum(workspacePath, albumDirectoryPath, discNum);
};

export const prepareCommitWorkspaceAlbum = async (
    workspacePath: string,
    albumDirectoryPath: string
): Promise<WorkspaceDisc[]> => {
    Logger.debug(`Prepare committing workspace album, workspace: ${workspacePath}, album: ${albumDirectoryPath}`);
    return await window.__anni_bridge.commitAlbumPrepare(workspacePath, albumDirectoryPath);
};

export const commitWorkspaceAlbum = async (workspacePath: string, albumDirectoryPath: string): Promise<void> => {
    Logger.debug(`Commit workspace album,workspace: ${workspacePath}, album: ${albumDirectoryPath} `);
    return await window.__anni_bridge.commitAlbum(workspacePath, albumDirectoryPath);
};
