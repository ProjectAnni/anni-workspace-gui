import { atom } from "jotai";
import TOML from "@ltd/j-toml";
import { atomWithStorage } from "jotai/utils";
import { ExtendedRepoConfig, RepoConfig } from "@/types/repo";

export const WorkspaceBasePathAtom = atomWithStorage("workspace_base_path", "");

export const WorkspaceRepoBasePathAtom = atom(async (get) =>
    window.__native_bridge.path.resolve(get(WorkspaceBasePathAtom), ".anni/repo/")
);

export const WorkspaceRepoTagBasePathAtom = atom(async (get) =>
    window.__native_bridge.path.resolve(get(WorkspaceBasePathAtom), ".anni/repo/tag/")
);

export const WorkspaceRepoConfigAtom = atom(async (get) => {
    const basePath = get(WorkspaceBasePathAtom);
    const repoConfigPath = await window.__native_bridge.path.resolve(basePath, ".anni/repo/repo.toml");
    const configFileContent = await window.__native_bridge.fs.readTextFile(repoConfigPath);
    const parsedConfigFile = (TOML.parse(configFileContent)?.repo as unknown as RepoConfig) || {};
    const albumDirectories = parsedConfigFile.albums || ["album"];
    const extendedConfig: ExtendedRepoConfig = {
        ...parsedConfigFile,
        albumPaths: [],
    };
    for (const p of albumDirectories) {
        extendedConfig.albumPaths!.push(await window.__native_bridge.path.resolve(basePath, `.anni/repo/${p}`));
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
