import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button, ButtonGroup, Intent } from "@blueprintjs/core";
import { ParsedDiscData } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import styles from "./index.module.scss";
import DiscTitleEditor from "./DiscTitleEditor";
import DiscCatalogEditor from "./DiscCatalogEditor";

interface Props {
    disc: ParsedDiscData;
    index: number;
}

const DiscInfoEditor: React.FC<Props> = (props) => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { disc, index } = props;

    const onDiscTitleChange = (newTitle: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_DISC_TITLE,
            payload: {
                index,
                title: newTitle,
            },
        });
    };

    const onDiscCatalogChange = (newCatalog: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_DISC_CATALOG,
            payload: {
                index,
                catalog: newCatalog,
            },
        });
    };

    const onDiscDelete = () => {
        dispatch({
            type: AlbumDataActionTypes.DELETE_DISC,
            payload: {
                index,
            },
        });
    };

    return (
        <>
            <div className={styles.discTitleContainer}>
                <DiscTitleEditor
                    disc={disc}
                    index={index}
                    onChange={onDiscTitleChange}
                />
                <DiscCatalogEditor disc={disc} onChange={onDiscCatalogChange} />
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    <ButtonGroup minimal>
                        <Button
                            text="删除"
                            small
                            intent={Intent.DANGER}
                            onClick={onDiscDelete}
                        />
                    </ButtonGroup>
                </div>
            </div>
            <div className={styles.discTitleDivider}></div>
            <div className={styles.secondaryActions}>
                <ButtonGroup minimal>
                    <Button text="设置艺术家" minimal className={styles.secondaryActionButton} />
                </ButtonGroup>
            </div>
        </>
    );
};

export default DiscInfoEditor;
