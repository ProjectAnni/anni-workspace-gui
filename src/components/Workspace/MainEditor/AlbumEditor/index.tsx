import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { OpenedDocumentAtom } from "../../state";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "./state";
import { readAlbumFile, writeAlbumFile } from "../../../../utils/file";
import styles from "./index.module.scss";
import { Spinner } from "@blueprintjs/core";
import AlbumMetaInfoEditor from "./AlbumMetaInfoEditor";

const AlbumEditor: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    useEffect(() => {
        let expired = false;
        (async () => {
            if (openedDocument.path) {
                setIsLoading(true);
                const albumData = await readAlbumFile(openedDocument.path);
                if (!expired) {
                    dispatch({
                        type: AlbumDataActionTypes.RESET,
                        payload: albumData,
                    });
                }
                setIsLoading(false);
            }
        })();
        return () => {
            expired = true;
        };
    }, [openedDocument]);

    useEffect(() => {
        // 回写Album文件
        if (openedDocument?.path && albumData) {
            writeAlbumFile(albumData, openedDocument.path);
        }
    }, [albumData, openedDocument]);

    if (!openedDocument?.path) {
        return null;
    }
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner />
            </div>
        );
    }
    return (
        <div className={styles.albumContainer}>
            <AlbumMetaInfoEditor />
        </div>
    );
};

export default AlbumEditor;
