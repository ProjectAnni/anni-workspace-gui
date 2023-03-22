import Logger from "@/utils/log";

class DestinationAlreadyExistsError extends Error {}
class UnsupportedFileType extends Error {}

export const copyDirectory = async (origin: string, destination: string) => {
    Logger.debug(`Copy directory, from: ${origin}, to: ${destination}`);
    if (await window.__native_bridge.fs.exists(destination)) {
        throw new DestinationAlreadyExistsError("目标文件夹已存在");
    }
    const dir = await window.__native_bridge.fs.readDir(origin);
    await window.__native_bridge.fs.createDir(destination);
    for (const entry of dir) {
        if (!entry.name) {
            throw new UnsupportedFileType("文件类型不受支持");
        }
        const entryPath = await window.__native_bridge.path.resolve(origin, entry.name);
        if (entry.isDirectory) {
            await copyDirectory(entryPath, await window.__native_bridge.path.resolve(destination, entry.name));
        } else {
            await window.__native_bridge.fs.copyFile(
                entryPath,
                await window.__native_bridge.path.resolve(destination, entry.name)
            );
        }
    }
};

export async function searchFile(basePath: string | string[], filename: string) {
    const searchPaths = [...(Array.isArray(basePath) ? basePath : [basePath])];
    for (const searchPath of searchPaths) {
        const entries = await window.__native_bridge.fs.readDir(searchPath);
        const result = entries.find((entry) => entry.name === filename);
        if (result) {
            return await window.__native_bridge.path.resolve(searchPath, result.name);
        }
    }
    return null;
}
