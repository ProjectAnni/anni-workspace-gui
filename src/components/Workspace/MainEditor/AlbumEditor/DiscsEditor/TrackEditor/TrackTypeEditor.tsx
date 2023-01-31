import React, { useState } from "react";
import { useAtom } from "jotai";
import { Card, Button } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import CommonTypeEditor from "@/components/Workspace/CommonTypeEditor";
import { ParsedTrackData, ParsedDiscData } from "@/types/album";
import { AlbumDataReducerAtom } from "../../state";
import styles from "./index.module.scss";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
    onChange: (newType: string) => void;
}

const TrackTypeEditor: React.FC<Props> = (props) => {
    const { track, disc, onChange } = props;
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { type: albumType } = albumData || {};
    const { type: discType } = disc;
    const { type: trackType } = track;
    const [localType, setLocalType] = useState<string>(trackType || "");
    const [isShowInputCard, setIsShowInputCard] = useState(false);

    const onTypeChange = (newType: string) => {
        setLocalType(newType);
        onChange(newType);
    };
    return (
        <>
            <Popover2
                isOpen={isShowInputCard}
                minimal
                content={
                    <Card
                        className={styles.inputCard}
                        style={{
                            width: "auto",
                        }}
                    >
                        <CommonTypeEditor
                            initialValue={
                                localType || discType || albumType || ""
                            }
                            onChange={onTypeChange}
                        />
                    </Card>
                }
                position="bottom-left"
                onInteraction={(nextOpenState, e) => {
                    setIsShowInputCard(nextOpenState);
                }}
                targetTagName="div"
            >
                <div className={styles.popoverAnchor}></div>
            </Popover2>
            {trackType ? (
                <>
                    <div
                        className={styles.secondaryActionText}
                        onClick={() => {
                            setIsShowInputCard(true);
                        }}
                    >
                        <span title="点击设置类型">{trackType}</span>
                    </div>
                </>
            ) : (
                <Button
                    text="设置类型"
                    minimal
                    className={styles.secondaryActionButton}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                />
            )}
        </>
    );
};

export default TrackTypeEditor;
