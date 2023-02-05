import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { Spinner } from "@blueprintjs/core";
import { readAlbumFile, writeAlbumFile } from "@/utils/album";
import { OpenedDocumentAtom } from "../../state";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "./state";
import AlbumMetaInfoEditor from "./AlbumMetaInfoEditor";
import styles from "./index.module.scss";
import DiscsEditor from "./DiscsEditor";

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
        if (
            openedDocument?.path &&
            albumData &&
            albumData.catalog &&
            openedDocument.path.includes(albumData.catalog)
        ) {
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
            <div className={styles.divider} />
            <DiscsEditor />
        </div>
    );
};

export default AlbumEditor;
