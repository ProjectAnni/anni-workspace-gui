import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button, ButtonGroup, Divider, Icon, Intent } from "@blueprintjs/core";
import { Artist, ParsedDiscData } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import styles from "./index.module.scss";
import DiscTitleEditor from "./DiscTitleEditor";
import DiscCatalogEditor from "./DiscCatalogEditor";
import DiscArtistEditor from "./DiscArtistEditor";
import DiscTypeEditor from "./DiscTypeEditor";

interface Props {
    disc: ParsedDiscData;
    index: number;
}

const DiscInfoEditor: React.FC<Props> = (props) => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { type: albumType } = albumData || {};
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

    const onDiscArtistChange = (newArtists: Artist[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_DISC_ARTIST,
            payload: {
                index,
                artists: newArtists,
            },
        });
    };

    const onDiscTypeChange = (newType: string) => {
        if (newType === albumType) {
            dispatch({
                type: AlbumDataActionTypes.UPDATE_DISC_TYPE,
                payload: {
                    index,
                    type: "",
                },
            });
        } else {
            dispatch({
                type: AlbumDataActionTypes.UPDATE_DISC_TYPE,
                payload: {
                    index,
                    type: newType,
                },
            });
        }
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
                <Icon
                    icon="chevron-right"
                    size={12}
                    className={styles.leftIcon}
                />
                <ButtonGroup minimal className={styles.secondaryActionButtonGroup}>
                    <DiscArtistEditor
                        disc={disc}
                        onChange={onDiscArtistChange}
                    />
                    <Divider />
                    <DiscTypeEditor disc={disc} onChange={onDiscTypeChange} />
                </ButtonGroup>
            </div>
        </>
    );
};

export default DiscInfoEditor;
