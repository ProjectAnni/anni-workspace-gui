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
        </div>
    );
};

export default AlbumDirectory;
