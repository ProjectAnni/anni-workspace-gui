import React, { Suspense } from "react";
import { Spinner } from "@blueprintjs/core";
import AlbumFileList from "./AlbumFileList";
import styles from "./index.module.scss";

const AlbumDirectory: React.FC = () => {
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
