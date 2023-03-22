import { TreeNodeInfo } from "@blueprintjs/core";

export interface AlbumDirectory {
    label: string;
    name: string;
    path: string;
    children?: AlbumDirectory[];
}

const readDirRecursive = async (directoryPath: string) => {
    const dir = await window.__native_bridge.fs.readDir(directoryPath);
    const result: AlbumDirectory[] = [];
    for (const entry of dir) {
        const entryPath = await window.__native_bridge.path.resolve(directoryPath, entry.name);
        result.push({
            label: await window.__native_bridge.path.basename(entryPath, ".toml"),
            name: entry.name,
            path: entryPath,
            children: entry.isDirectory ? await readDirRecursive(entryPath) : undefined,
        });
    }
    return result;
};

export const readAlbumDir = async (albumPath: string) => {
    const entries = await readDirRecursive(albumPath);
    const basename = await window.__native_bridge.path.basename(albumPath);
    const result: AlbumDirectory = {
        label: basename,
        name: basename,
        path: albumPath,
        children: entries,
    };
    return result;
};

export const getAllAlbumFilePaths = (directory: AlbumDirectory): string[] => {
    const result: string[] = [];
    for (const subEntry of directory.children || []) {
        if (subEntry.children?.length) {
            //  is directory
            result.push(...subEntry.children.map(getAllAlbumFilePaths).flat());
        } else {
            result.push(subEntry.path);
        }
    }
    return result;
};

export const convertDirectoriesToTreeNodes = (
    directories: AlbumDirectory[],
    openedDocument: { label: string; path: string }
): TreeNodeInfo[] => {
    return directories.map<TreeNodeInfo>((directory, index) => ({
        label: directory.label,
        id: directory.path,
        childNodes: (directory.children || []).map((child) => convertFileEntryToTreeNode(child, openedDocument)),
        isExpanded: index === 0,
    }));
};

export const convertFileEntryToTreeNode = (
    entry: AlbumDirectory,
    openedDocument: { label: string; path: string }
): TreeNodeInfo => {
    if (entry.children) {
        const childNodes = entry.children.map((child) => convertFileEntryToTreeNode(child, openedDocument));
        return {
            label: entry.label,
            id: entry.path,
            icon: "document",
            childNodes,
        };
    }
    return {
        label: entry.label,
        id: entry.path,
        icon: "document",
        isSelected: entry.path === openedDocument.path,
    };
};
