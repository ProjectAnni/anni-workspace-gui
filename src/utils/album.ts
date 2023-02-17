import { pick, throttle } from "lodash";
import { invoke, fs, path } from "@tauri-apps/api";
import { AlbumData, DiscData, ParsedAlbumData, ParsedDiscData, ParsedTrackData, TrackData } from "@/types/album";
import { parseArtists, parseCatalog, stringifyArtists } from "./helper";
import Logger from "./log";
import { processTauriError } from "./error";

export const readAlbumFile = async (path: string): Promise<ParsedAlbumData> => {
    let content: AlbumData;
    try {
        content = (await invoke("read_album_file", {
            path,
        })) as AlbumData;
    } catch (e) {
        throw processTauriError(e);
    }
    const parsedAlbum: ParsedAlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "tags", "title", "type", "edition"),
        ...(content.artist ? { artist: parseArtists(content.artist) } : { artist: [] }),
        discs: [],
    };
    for (const disc of content.discs) {
        const parsedDisc: ParsedDiscData = {
            ...pick(disc, "title", "catalog", "type"),
            ...(disc.artist ? { artist: parseArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const parsedTrack: ParsedTrackData = {
                ...pick(track, "title", "type"),
                ...(track.artist
                    ? {
                          artist: parseArtists(track.artist),
                      }
                    : {}),
            };
            parsedDisc.tracks.push(parsedTrack);
        }
        parsedAlbum.discs.push(parsedDisc);
    }
    return parsedAlbum;
};

export const writeAlbumFile = throttle(async (content: ParsedAlbumData, path: string) => {
    const albumData: AlbumData = {
        album_id: content.album_id,
        ...pick(content, "catalog", "date", "title", "type"),
        ...(content.edition ? { edition: content.edition } : {}),
        ...(content.tags ? { tags: content.tags } : { tags: [] }),
        ...(content.artist ? { artist: stringifyArtists(content.artist) } : { artist: "" }),
        discs: [],
    };
    for (const disc of content.discs) {
        const discData: DiscData = {
            ...pick(disc, "catalog"),
            ...(disc.title ? { title: disc.title } : {}),
            ...(disc.type ? { type: disc.type } : {}),
            ...(disc.artist?.length ? { artist: stringifyArtists(disc.artist) } : {}),
            tracks: [],
        };
        for (const track of disc.tracks) {
            const trackData: TrackData = {
                ...pick(track, "title"),
                ...(track.type ? { type: track.type } : {}),
                ...(track.artist?.length
                    ? {
                          artist: stringifyArtists(track.artist),
                      }
                    : {}),
            };
            discData.tracks.push(trackData);
        }
        albumData.discs.push(discData);
    }
    try {
        await invoke("write_album_file", {
            path,
            albumJsonStr: JSON.stringify(albumData),
        });
    } catch (e) {
        throw processTauriError(e);
    }
}, 2000);

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
