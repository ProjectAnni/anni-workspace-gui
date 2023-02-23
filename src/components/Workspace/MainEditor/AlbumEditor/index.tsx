import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Spinner } from "@blueprintjs/core";
import { getAlbumFileWriter, readAlbumFile } from "@/utils/album";
import Logger from "@/utils/log";
import { OpenedDocumentAtom } from "../../state";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "./state";
import AlbumMetaInfoEditor from "./AlbumMetaInfoEditor";
import DiscsEditor from "./DiscsEditor";
import styles from "./index.module.scss";

const AlbumEditor: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const isInitialized = useRef(false);

    const albumDataWriter = useMemo(() => getAlbumFileWriter(), []);

    useEffect(() => {
        let expired = false;
        (async () => {
            if (openedDocument.path) {
                setIsLoading(true);
                Logger.debug(`Load album toml start. label: ${openedDocument.label}, path: ${openedDocument.path}`);
                const albumData = await readAlbumFile(openedDocument.path);
                if (!expired) {
                    dispatch({
                        type: AlbumDataActionTypes.RESET,
                        payload: albumData,
                    });
                }
                Logger.debug("Load album toml done.");
                setIsLoading(false);
                isInitialized.current = true;
            }
        })();
        return () => {
            expired = true;
        };
    }, [openedDocument]);

    useEffect(() => {
        // 回写Album文件
        if (isInitialized.current && openedDocument.path && albumData) {
            Logger.debug(`Write album toml. label: ${openedDocument.label}, path: ${openedDocument.path}`);
            albumDataWriter(albumData, openedDocument.path);
        }
    }, [albumData, openedDocument, albumDataWriter]);

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
