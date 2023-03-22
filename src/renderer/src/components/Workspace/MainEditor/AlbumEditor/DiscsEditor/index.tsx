import React from "react";
import { useAtom } from "jotai";
import { Button, Intent } from "@blueprintjs/core";
import { parseCatalog } from "@/utils/helper";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import DiscInfoEditor from "./DiscInfoEditor";
import TrackEditor from "./TrackEditor";
import styles from "./index.module.scss";
import { AppToaster } from "@/utils/toaster";

const DiscsEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { discs, catalog } = albumData || {};

    const onAppendDisc = (discIndex: number) => {
        if (!catalog) {
            AppToaster.show({ message: "请先设置专辑品番", intent: Intent.DANGER });
            return;
        }
        const parsedCatalog = parseCatalog(catalog);
        if (!parsedCatalog[discIndex + 1]) {
            AppToaster.show({ message: "请先扩展专辑品番使其对应新碟片数量", intent: Intent.DANGER });
            return;
        }
        dispatch({ type: AlbumDataActionTypes.APPEND_DISC, payload: { catalog: parsedCatalog[discIndex + 1] } });
    };

    const onAppendTrack = (discIndex: number, trackIndex: number) => {
        dispatch({
            type: AlbumDataActionTypes.APPEND_TRACK,
            payload: {
                discIndex,
                trackIndex,
            },
        });
    };

    if (!discs?.length) {
        return null;
    }
    return (
        <>
            {discs.map((disc, discIndex) => {
                const { tracks } = disc;
                const isLastDisc = discIndex === discs.length - 1;
                return (
                    <div key={disc.catalog} className={styles.discContainer}>
                        <DiscInfoEditor disc={disc} index={discIndex} />
                        {tracks.map((track, trackIndex) => {
                            return (
                                <TrackEditor
                                    key={trackIndex}
                                    track={track}
                                    trackIndex={trackIndex}
                                    disc={disc}
                                    discIndex={discIndex}
                                />
                            );
                        })}
                        <div className={styles.actions}>
                            {isLastDisc && (
                                <Button
                                    minimal
                                    text="新增碟片"
                                    outlined
                                    className={styles.actionButton}
                                    onClick={() => {
                                        onAppendDisc(discIndex);
                                    }}
                                ></Button>
                            )}
                            <Button
                                minimal
                                text="新增轨道"
                                outlined
                                className={styles.actionButton}
                                onClick={() => {
                                    onAppendTrack(discIndex, tracks.length);
                                }}
                            ></Button>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default DiscsEditor;
