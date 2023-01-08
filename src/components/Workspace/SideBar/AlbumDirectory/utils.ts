import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import { TreeNodeInfo } from "@blueprintjs/core";

interface FileEntryWithLabel extends fs.FileEntry {
    label: string;
    children?: FileEntryWithLabel[];
}

const addLabelToFileEntry = async (
    entry: fs.FileEntry
): Promise<FileEntryWithLabel> => {
    if (entry.children) {
        const childrenWithLabel = [];
        for (const child of entry.children) {
            childrenWithLabel.push(await addLabelToFileEntry(child));
        }
        return {
            name: entry.name,
            path: entry.path,
            label: await path.basename(entry.path),
            children: childrenWithLabel,
        };
    }
    return {
        name: entry.name,
        path: entry.path,
        label: await path.basename(entry.path, `.toml`),
    };
};

export interface AlbumDirectory {
    label: string;
    path: string;
    children: FileEntryWithLabel[];
}

export const readAlbumDir = async (albumPath: string) => {
    const entries = await fs.readDir(albumPath, { recursive: true });
    const result: AlbumDirectory = {
        label: await path.basename(albumPath),
        path: albumPath,
        children: [],
    };
    for (const entry of entries) {
        result.children.push(await addLabelToFileEntry(entry));
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
        childNodes: directory.children.map((child) =>
            convertFileEntryToTreeNode(child, openedDocument)
        ),
        isExpanded: index === 0,
    }));
};

export const convertFileEntryToTreeNode = (
    entry: FileEntryWithLabel,
    openedDocument: { label: string; path: string }
): TreeNodeInfo => {
    if (entry.children) {
        const childNodes = entry.children.map((child) =>
            convertFileEntryToTreeNode(child, openedDocument)
        );
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
