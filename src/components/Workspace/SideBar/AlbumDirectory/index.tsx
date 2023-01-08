import React, { Suspense, useCallback, useEffect, useState } from "react";
import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import {
    Spinner,
    Tree,
    TreeEventHandler,
    TreeNodeInfo,
} from "@blueprintjs/core";
import AlbumFileList from "./AlbumFileList";
import styles from "./index.module.scss";

const AlbumDirectory: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [treeContents, setTreeContent] = useState<TreeNodeInfo[]>();
    // const repoConfig = useRepository();
    // const { albumPaths } = repoConfig || {};
    // useEffect(() => {
    //     (async () => {
    //         if (!albumPaths?.length) {
    //             return;
    //         }
    //         const albumDirs = [];
    //         for (const albumPath of albumPaths) {
    //             albumDirs.push(await readAlbumDir(albumPath));
    //         }
    //         console.log(albumDirs);
    //         // setTreeContent(contents);
    //         setIsLoading(false);
    //     })();
    // }, [albumPaths]);
    // const onNodeExpand = useCallback<TreeEventHandler>(
    //     (_, nodePath) => {
    //         if (!treeContents) {
    //             return;
    //         }
    //         const newTreeContents = [...treeContents];
    //         const node = Tree.nodeFromPath(nodePath, newTreeContents);
    //         node.isExpanded = true;
    //         setTreeContent(newTreeContents);
    //     },
    //     [treeContents]
    // );
    // const onNodeCollapse = useCallback<TreeEventHandler>(
    //     (_, nodePath) => {
    //         if (!treeContents) {
    //             return;
    //         }
    //         const newTreeContents = [...treeContents];
    //         const node = Tree.nodeFromPath(nodePath, newTreeContents);
    //         node.isExpanded = false;
    //         setTreeContent(newTreeContents);
    //     },
    //     [treeContents]
    // );
    // if (!repoConfig) {
    //     return null;
    // }

    return (
        <div className={styles.albumDirectory}>
            <Suspense
                fallback={
                    <div className={styles.loading}>
                        <Spinner size={30} />
                    </div>
                }
            >
                <AlbumFileList />
            </Suspense>
            {/* <Tree
                contents={treeContents}
                onNodeCollapse={onNodeCollapse}
                onNodeExpand={onNodeExpand}
            /> */}
        </div>
    );
};

export default AlbumDirectory;
