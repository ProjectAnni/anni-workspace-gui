import { atom } from "jotai";
import TOML from "@ltd/j-toml";
import { atomWithStorage } from "jotai/utils";
import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import { ExtendedRepoConfig, RepoConfig } from "@/types/repo";

export const WorkspaceBasePathAtom = atomWithStorage("workspace_base_path", "");

export const WorkspaceRepoBasePathAtom = atom(async (get) => path.resolve(get(WorkspaceBasePathAtom), ".anni/repo/"));

export const WorkspaceRepoTagBasePathAtom = atom(async (get) =>
    path.resolve(get(WorkspaceBasePathAtom), ".anni/repo/tag/")
);

export const WorkspaceRepoConfigAtom = atom(async (get) => {
    const basePath = get(WorkspaceBasePathAtom);
    const repoConfigPath = await path.resolve(basePath, ".anni/repo/repo.toml");
    const configFileContent = await fs.readTextFile(repoConfigPath);
    const parsedConfigFile = (TOML.parse(configFileContent)?.repo as unknown as RepoConfig) || {};
    const albumDirectories = parsedConfigFile.albums || ["album"];
    const extendedConfig: ExtendedRepoConfig = {
        ...parsedConfigFile,
        albumPaths: [],
    };
    for (const p of albumDirectories) {
        extendedConfig.albumPaths!.push(await path.resolve(basePath, `.anni/repo/${p}`));
    }
    return extendedConfig;
});

export enum OpenedDocumentType {
    ALBUM,
    TAG,
}

export const OpenedDocumentAtom = atom({
    label: "",
    path: "",
    type: OpenedDocumentType.ALBUM,
});
