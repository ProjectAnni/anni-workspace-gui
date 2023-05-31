import React, { useState } from "react";
import { Button, Card } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedTrackData, ParsedDiscData } from "@/types/album";
import { ParsedTag } from "@/types/tag";
import CommonTagEditor from "@/components/Workspace/CommonTagEditor";
import styles from "./index.module.scss";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
    onChange: (newTags: ParsedTag[]) => void;
}

const TrackTagEditor: React.FC<Props> = (props) => {
    const { track, onChange } = props;
    const { tags } = track;
    const [localTags, setLocalTags] = useState<ParsedTag[]>(tags || []);
    const [isShowInputCard, setIsShowInputCard] = useState(false);

    const onTagChange = (newTags: ParsedTag[]) => {
        setLocalTags(newTags);
        onChange(newTags);
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
                            minWidth: "200px",
                        }}
                        onClick={(e) => {
                            // 阻止点击冒泡（防止点击候选项导致popover关闭)
                            e.stopPropagation();
                        }}
                    >
                        <CommonTagEditor autoFocus initialTags={localTags} onChange={onTagChange} />
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
            {tags?.length ? (
                <div
                    className={styles.secondaryActionText}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                >
                    <span className={styles.prefix}></span>
                    <span title="点击设置标签">{tags.join(" / ")}</span>
                </div>
            ) : (
                <Button
                    minimal
                    className={styles.secondaryActionButton}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                >
                    设置标签
                </Button>
            )}
        </>
    );
};

export default TrackTagEditor;
