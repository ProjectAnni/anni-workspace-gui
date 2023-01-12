import { throttle } from "lodash";
import { invoke } from "@tauri-apps/api";
import { AlbumData } from "./types";

export const readAlbumFile = async (path: string) => {
    const content = await invoke("read_album_file", {
        path,
    });
    return content;
};

export const writeAlbumFile = throttle(
    async (content: AlbumData, path: string) => {
        await invoke("write_album_file", {
            path,
            albumJsonStr: JSON.stringify(content),
        });
    },
    2000
);
