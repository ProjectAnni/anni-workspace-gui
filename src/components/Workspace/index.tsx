import React, { useEffect } from "react";
import { useAtom } from "jotai";
import { WorkspaceRepoConfigAtom } from "@/components/Workspace/state";
import AlbumFileIndexer from "@/indexer/AlbumFileIndexer";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import { RepositoryContext } from "./context";
import styles from "./index.module.scss";
import MainEditor from "./MainEditor";
import {
    getAllAlbumFilePaths,
    readAlbumDir,
} from "./SideBar/AlbumDirectory/utils";

const Workspace: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    const { albumPaths } = repoConfig || {};
    useEffect(() => {
        requestIdleCallback(async () => {
            for (const albumPath of albumPaths) {
                const albumDirectory = await readAlbumDir(albumPath);
                const albumFilePaths = getAllAlbumFilePaths(albumDirectory);
                AlbumFileIndexer.addPaths(albumFilePaths);
                AlbumFileIndexer.start();
            }
        });
    }, []);
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
