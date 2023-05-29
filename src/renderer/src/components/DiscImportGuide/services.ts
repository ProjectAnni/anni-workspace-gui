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
    return new Uint8Array(response.data);
};

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

const DEFAULT_COVER_FILENAME = "cover.jpg";

export const readAlbumCover = async (baseDirectory: string) => {
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

    Logger.debug(
        `Write cover data: [binary] -> ${await window.__native_bridge.path.resolve(
            baseDirectory,
            DEFAULT_COVER_FILENAME
        )}`
    );
    await window.__native_bridge.fs.writeFile(
        await window.__native_bridge.path.resolve(baseDirectory, DEFAULT_COVER_FILENAME),
        coverData
    );

    if (hasMultiDiscs) {
        const discEntries = dir.filter((entry) => entry.isDirectory);
        for (const discEntry of discEntries) {
            Logger.debug(
                `Write cover data: [binary] -> ${await window.__native_bridge.path.resolve(
                    baseDirectory,
                    discEntry.name,
                    DEFAULT_COVER_FILENAME
                )}`
            );
            await window.__native_bridge.fs.writeFile(
                await window.__native_bridge.path.resolve(baseDirectory, discEntry.name, DEFAULT_COVER_FILENAME),
                coverData
            );
        }
    }
};

/** 删除非 cover.jpg 的封面文件 */
export const cleanupCover = async (baseDirectory: string) => {
    Logger.debug(`Cleanup covers in directory: ${baseDirectory}`);
    const dir = await window.__native_bridge.fs.readDir(baseDirectory);
    const hasMultiDiscs = dir.some((entry) => entry.isDirectory);

    for (const entry of dir) {
        if (entry.name !== DEFAULT_COVER_FILENAME && alternativeCoverFilenames.includes(entry.name)) {
            const coverPath = await window.__native_bridge.path.resolve(baseDirectory, entry.name);
            Logger.debug(`Cleanup cover file: ${coverPath}`);
            await window.__native_bridge.fs.deleteFile(coverPath);
        }
    }

    if (hasMultiDiscs) {
        const discEntries = dir.filter((entry) => entry.isDirectory);
        for (const discEntry of discEntries) {
            const discPath = await window.__native_bridge.path.resolve(baseDirectory, discEntry.name);
            const discDir = await window.__native_bridge.fs.readDir(discPath);
            for (const entry of discDir) {
                if (entry.name !== DEFAULT_COVER_FILENAME && alternativeCoverFilenames.includes(entry.name)) {
                    const coverPath = await window.__native_bridge.path.resolve(discPath, entry.name);
                    Logger.debug(`Cleanup cover file: ${coverPath}`);
                    await window.__native_bridge.fs.deleteFile(coverPath);
                }
            }
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
    const discNum = dir.filter((entry) => entry.isDirectory).length || 1;

    const catalogs = parseCatalog(catalog);
    if (catalogs.length !== discNum) {
        throw new Error("碟片数量与品番不匹配");
    }

    const finalName = `[${date}][${catalog}] ${title}${edition ? `【${edition}】` : ""}${discNum > 1 ? ` [${discNum} Discs]` : ""
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
        const newDir = await window.__native_bridge.fs.readDir(newAlbumDirectoryPath);
        const discEntries = newDir.filter((entry) => entry.isDirectory).sort(); // 字典序排序
        let counter = 1;
        for (const discEntry of discEntries) {
            const originDiscDirectoryPath = await window.__native_bridge.path.resolve(
                newAlbumDirectoryPath,
                discEntry.name
            );
            const newDiscDirectoryName = `Disc ${counter}`;
            const newDiscDirectoryPath = await window.__native_bridge.path.resolve(
                originDiscDirectoryPath,
                `../${newDiscDirectoryName}`
            );
            Logger.debug(`Rename ${originDiscDirectoryPath} -> ${newDiscDirectoryPath}`);
            await window.__native_bridge.fs.rename(originDiscDirectoryPath, newDiscDirectoryPath);
            counter += 1;
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

interface AutoParseAlbumInformationParams {
    apiEndpoint: string;
    apiKey: string;
    model: string;
    text: string;
}

export interface AutoParseAlbumInformationResult {
    title: string;
    date: string;
    catalog: string;
}

export const autoParseAlbumInformation = async ({
    apiEndpoint,
    apiKey,
    model,
    text,
}: AutoParseAlbumInformationParams) => {
    const url = `${apiEndpoint}/v1/chat/completions`;
    const prompt = `你的任务是从一段文本中提取一张专辑的相关信息，包括标题（title）、品番（catalog）、发售日期（date）。品番一般是由三到四位大写字母和四到五位数字用「-」连接的字符串，例如LACM-20199。将你提取的信息用JSON格式返回。你需要将发售日期转换为YYYY-MM-DD的格式。如果无法在文本中提取出某一信息，就不要在结果中包含对应字段。你的返回只应该包含JSON内容，不要添加其他内容，不要说明理由。你的提取结果应该准确无误。下面是你需要处理的文本：`;
    Logger.debug(`Try getting parsed album information from OpenAI, text: ${text}`);
    const response = await axios.post(
        url,
        {
            model,
            messages: [
                {
                    role: "user",
                    content: `${prompt}${text}`,
                },
            ],
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
        }
    );
    const result = response.data?.choices?.[0]?.message?.content;
    let parsedAlbum: AutoParseAlbumInformationResult;
    try {
        parsedAlbum = JSON.parse(
            result
                .replaceAll("\n", "")
                .match(/({.+})/)[1]
                .trim()
        );
    } catch (e) {
        Logger.error(`Failed to parse text, wrong model output? response: ${result}`);
        throw new Error("无法识别或无法解析");
    }
    if (!parsedAlbum.title || !parsedAlbum.catalog || !parsedAlbum.date) {
        Logger.error(`Failed to parse text, missing required fields, response: ${result}`);
        throw new Error("无法识别或无法解析: 缺少信息");
    }
    Logger.debug(`Got parsed album information, result: ${JSON.stringify(parsedAlbum)}`);
    return parsedAlbum;
};
