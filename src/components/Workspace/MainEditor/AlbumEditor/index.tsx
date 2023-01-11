import { useAtom, useAtomValue } from "jotai";
import React, { useEffect, useState } from "react";
import { OpenedDocumentAtom } from "../../state";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "./state";
import { readAlbumFile } from "./utils";
import styles from "./index.module.scss";
import { Spinner } from "@blueprintjs/core";

const AlbumEditor: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const { album } = albumData || {};
    const { title } = album || {};
    useEffect(() => {
        let expired = false;
        (async () => {
            setIsLoading(true);
            const albumData = await readAlbumFile(openedDocument.path);
            if (!expired) {
                dispatch({
                    type: AlbumDataActionTypes.RESET,
                    payload: albumData,
                });
            }
            setIsLoading(false);
        })();
        return () => {
            expired = true;
        };
    }, [openedDocument]);
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <Spinner />
            </div>
        );
    }
    return <div className={styles.albumContainer}>{title}</div>;
};

export default AlbumEditor;
