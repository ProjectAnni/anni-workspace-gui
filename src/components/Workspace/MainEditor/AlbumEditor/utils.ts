import * as fs from "@tauri-apps/api/fs";
import TOML from "@ltd/j-toml";
import { AlbumData } from "./types";

export const readAlbumFile = async (path: string) => {
    const content = await fs.readTextFile(path);
    const parsedContent = TOML.parse(content);
    return parsedContent as unknown as AlbumData;
};
