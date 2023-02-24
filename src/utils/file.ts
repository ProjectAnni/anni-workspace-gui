import { fs, path } from "@tauri-apps/api";
import Logger from "@/utils/log";

class DestinationAlreadyExistsError extends Error {}
class UnsupportedFileType extends Error {}

export const copyDirectory = async (origin: string, destination: string) => {
    Logger.debug(`Copy directory, from: ${origin}, to: ${destination}`);
    if (await fs.exists(destination)) {
        throw new DestinationAlreadyExistsError("目标文件夹已存在");
    }
    const dir = await fs.readDir(origin);
    await fs.createDir(destination);
    for (const entry of dir) {
        if (!entry.name) {
            throw new UnsupportedFileType("文件类型不受支持");
        }
        if (entry.children) {
            await copyDirectory(entry.path, await path.resolve(destination, entry.name));
        } else {
            await fs.copyFile(entry.path, await path.resolve(destination, entry.name));
        }
    }
};

export async function searchFile(basePath: string | string[], filename: string) {
    const searchPaths = [...(Array.isArray(basePath) ? basePath : [basePath])];
    for (const searchPath of searchPaths) {
        const entries = await fs.readDir(searchPath, { recursive: true });
        const result = entries.find((entry) => entry.name === filename);
        if (result) {
            return result.path;
        }
    }
}
