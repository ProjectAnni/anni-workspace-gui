import React from "react";
import { useAtom } from "jotai";
import { Button, FormGroup, Icon, InputGroup } from "@blueprintjs/core";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import styles from "./index.module.scss";

interface Props {}

const AlbumMetaInfoEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { album_id: albumId } = albumData || {};

    const onRefreshAlbumId = () => {
        dispatch({
            type: AlbumDataActionTypes.GENERATE_NEW_ALBUM_ID,
        });
    };

    if (!albumId) {
        return null;
    }

    return (
        <>
            <FormGroup label="Album ID" labelInfo="(required)">
                <div className={styles.albumIdContainer}>
                    <div className={styles.albumId}>{albumId}</div>
                    <Button icon="refresh" small onClick={onRefreshAlbumId} />
                </div>
            </FormGroup>
        </>
    );
};

export default AlbumMetaInfoEditor;
