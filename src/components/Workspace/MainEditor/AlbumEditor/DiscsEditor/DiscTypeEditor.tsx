import React, { useState } from "react";
import { useAtom } from "jotai";
import { Button, Card } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedDiscData } from "@/types/album";
import CommonTypeEditor from "@/components/Workspace/CommonTypeEditor";
import { AlbumDataReducerAtom } from "../state";
import styles from "./index.module.scss";

interface Props {
    disc: ParsedDiscData;
    onChange: (newType: string) => void;
}

const DiscTypeEditor: React.FC<Props> = (props) => {
    const { disc, onChange } = props;
    const { type } = disc || {};
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { type: albumType } = albumData || {};
    const [localType, setLocalType] = useState<string>(type || albumType || "");
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
                            initialValue={localType}
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
            {type ? (
                <>
                    <div
                        className={styles.secondaryActionText}
                        onClick={() => {
                            setIsShowInputCard(true);
                        }}
                    >
                        <span title="点击设置类型">{type}</span>
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

export default DiscTypeEditor;
