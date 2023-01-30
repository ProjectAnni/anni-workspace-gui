import React, { useRef, useState } from "react";
import { Card, InputGroup } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedDiscData, ParsedTrackData } from "@/types/album";
import styles from "./index.module.scss";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
    onChange: (newTitle: string) => void;
}

const TrackTitleEditor: React.FC<Props> = (props) => {
    const { track, trackIndex, onChange } = props;
    const { title } = track;

    const [isShowTitleInputCard, setIsShowTitleInputCard] = useState(false);
    const [localTitle, setLocalTitle] = useState(title);
    const titleRef = useRef();

    const onTrackTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
    };

    const onTrackTitleInputKeydown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setIsShowTitleInputCard(false);
        }
    };

    const onTrackTitleInputBlur = () => {
        onChange(localTitle);
        setIsShowTitleInputCard(false);
    };

    const onTrackTitleInputClose = () => {
        onChange(localTitle);
    };

    return (
        <div className={styles.trackTitle}>
            <Popover2
                isOpen={isShowTitleInputCard}
                content={
                    <Card className={styles.inputCard}>
                        <InputGroup
                            autoFocus
                            placeholder="设置音轨标题..."
                            value={localTitle}
                            onChange={onTrackTitleChange}
                            onBlur={onTrackTitleInputBlur}
                            onKeyDown={onTrackTitleInputKeydown}
                        />
                    </Card>
                }
                minimal
                position="bottom-left"
                onClose={onTrackTitleInputClose}
            >
                <div
                    className={styles.trackTitleContainer}
                    onClick={() => {
                        setIsShowTitleInputCard(true);
                    }}
                >
                    <span className={styles.trackIndex}>
                        {(trackIndex + 1).toString().padStart(2, "0")}.{" "}
                    </span>
                    <span
                        className={styles.trackTitle}
                        title="点击设置音轨标题"
                    >
                        {title}
                    </span>
                </div>
            </Popover2>
        </div>
    );
};

export default TrackTitleEditor;
