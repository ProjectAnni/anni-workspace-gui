import React from "react";
import { useAtom } from "jotai";
import { Button, FormGroup, InputGroup } from "@blueprintjs/core";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import ReleaseDateEditor from "./ReleaseDateEditor";
import styles from "./index.module.scss";

interface Props {}

const AlbumMetaInfoEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { album_id: albumId, title, catalog } = albumData || {};

    const onRefreshAlbumId = () => {
        dispatch({
            type: AlbumDataActionTypes.GENERATE_NEW_ID,
        });
    };

    const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TITLE,
            payload: e.target.value,
        });
    };

    const onCatalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_CATALOG,
            payload: e.target.value,
        });
    };

    const onReleaseDateChange = (value: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_RELEASE_DATE,
            payload: value,
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
            <FormGroup label="标题" labelInfo="(required)">
                <InputGroup value={title} onChange={onTitleChange} />
            </FormGroup>
            <FormGroup label="品番" labelInfo="(required)">
                <InputGroup value={catalog} onChange={onCatalogChange} />
            </FormGroup>
            <ReleaseDateEditor onChange={onReleaseDateChange} />
        </>
    );
};

export default AlbumMetaInfoEditor;
