import { fetch, ResponseType } from "@tauri-apps/api/http";
import { invoke, fs, path } from "@tauri-apps/api";
import Logger from "@/utils/log";
import { parseCatalog } from "@/utils/helper";
import { processTauriError } from "@/utils/error";

export interface CoverItem {
    id: string;
    thumbnailUrl: string;
    originUrl: string;
}

export const searchCoverFromITunes = async (keyword: string) => {
    const url = `https://itunes.apple.com/search?term=${keyword}&country=jp&media=music&entity=album`;
    const response = await fetch<any>(url, {
        method: "GET",
        responseType: ResponseType.JSON,
    });
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
    const response = await fetch<number[]>(url, {
        method: "GET",
        responseType: ResponseType.Binary,
    });
    return new Uint8Array(response.data);
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
        const coverPath = await path.resolve(baseDirectory, filename);
        if (await fs.exists(coverPath)) {
            Logger.debug(`Found cover: ${coverPath}`);
            return [await fs.readBinaryFile(coverPath), coverPath] as const;
        }
    }
    return null;
};

export const writeAlbumCover = async (baseDirectory: string, coverData: Uint8Array) => {
    Logger.debug(`Write cover: ${baseDirectory}`);
    const dir = await fs.readDir(baseDirectory);
    const hasMultiDiscs = dir.some((entry) => !!entry.children);
    if (!hasMultiDiscs) {
        Logger.debug(`Write cover data: [binary] -> ${await path.resolve(baseDirectory, "cover.jpg")}`);
        await fs.writeBinaryFile(await path.resolve(baseDirectory, "cover.jpg"), coverData);
    } else {
        const discEntries = dir.filter((entry) => !!entry.children);
        for (const discEntry of discEntries) {
            Logger.debug(`Write cover data: [binary] -> ${await path.resolve(discEntry.path, "cover.jpg")}`);
            await fs.writeBinaryFile(await path.resolve(discEntry.path, "cover.jpg"), coverData);
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
    const dir = await fs.readDir(originPath);
    const discNum = dir.filter((entry) => !!entry.children).length;

    if (discNum === 1) {
        throw new Error("多Disc，但好像又没多");
    }

    const finalName = `[${date}][${catalog}] ${title}${edition ? `【${edition}】` : ""}${
        discNum > 1 ? ` [${discNum} Discs]` : ""
    }`;

    const newAlbumDirectoryPath = await path.resolve(originPath, `../${finalName}`);
    Logger.debug(`Rename ${originPath} -> ${newAlbumDirectoryPath}`);
    // rename album directory
    await fs.renameFile(originPath, newAlbumDirectoryPath);

    if (discNum > 1) {
        // rename disc folders
        const catalogs = parseCatalog(catalog);
        if (catalogs.length !== discNum) {
            throw new Error("碟片数量与品番不匹配");
        }
        const newDir = await fs.readDir(newAlbumDirectoryPath);
        const discEntries = newDir.filter((entry) => !!entry.children).sort(); // 字典序排序
        let counter = 1;
        for (const discEntry of discEntries) {
            const originDiscDirectoryPath = discEntry.path;
            const newDiscDirectoryName = `[${catalogs[counter - 1]}] ${title} [Disc ${counter}]`;
            const newDiscDirectoryPath = await path.resolve(originDiscDirectoryPath, `../${newDiscDirectoryName}`);
            Logger.debug(`Rename ${originDiscDirectoryPath} -> ${newDiscDirectoryPath}`);
            await fs.renameFile(originDiscDirectoryPath, newDiscDirectoryPath);
        }
    }

    return newAlbumDirectoryPath;
};

export const createWorkspaceAlbum = async (workspacePath: string, albumDirectoryPath: string) => {
    const dir = await fs.readDir(albumDirectoryPath);
    const discNum = dir.filter((entry) => !!entry.children).length;
    Logger.debug(`Create workspace album, workspace: ${workspacePath}, album: ${albumDirectoryPath}`);
    try {
        await invoke("create_album", {
            workspace: workspacePath,
            path: albumDirectoryPath,
            discNum,
        });
    } catch (e) {
        throw processTauriError(e);
    }
};
