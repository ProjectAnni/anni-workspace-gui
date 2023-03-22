import React, { useEffect } from "react";
import { useAtom, useAtomValue } from "jotai";
import { WorkspaceRepoConfigAtom } from "@/components/Workspace/state";
import AlbumFileIndexer from "@/indexer/AlbumFileIndexer";
import Logger from "@/utils/log";
import MainEditor from "./MainEditor";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import { getAllAlbumFilePaths, readAlbumDir } from "./SideBar/AlbumDirectory/utils";
import { TagDirectoryContentAtom } from "./SideBar/TagDirectory/state";
import { RepositoryContext } from "./context";
import styles from "./index.module.scss";
import TagFileIndexer from "@/indexer/TagFileIndexer";

const Workspace: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    const tagFiles = useAtomValue(TagDirectoryContentAtom);
    const { albumPaths } = repoConfig || {};
    useEffect(() => {
        Logger.debug("Load workspace.");
        Logger.debug(`albumPaths: ${JSON.stringify(albumPaths)}`);
        requestIdleCallback(async () => {
            Logger.debug(`Start reading album paths.`);
            for (const albumPath of albumPaths) {
                const albumDirectory = await readAlbumDir(albumPath);
                const albumFilePaths = getAllAlbumFilePaths(albumDirectory);
                AlbumFileIndexer.addPaths(albumFilePaths);
                AlbumFileIndexer.start();
            }
            Logger.debug("Read album directories done.");
        });
    }, [albumPaths]);
    useEffect(() => {
        if (tagFiles?.length) {
            requestIdleCallback(() => {
                Logger.debug("Start indexing tags.");
                TagFileIndexer.addPaths(tagFiles.map((file) => file.path));
                TagFileIndexer.start();
            });
        }
    }, [tagFiles]);
    return (
        <>
            <RepositoryContext.Provider value={repoConfig}>
                <div className={styles.main}>
                    <SideBar />
                    <MainEditor />
                </div>
                <BottomBar />
            </RepositoryContext.Provider>
        </>
    );
};

export default Workspace;
