import React, { useState } from "react";
import { Button, Card } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { stringifyArtists } from "@/utils/helper";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { Artist, ParsedDiscData } from "@/types/album";
import styles from "./index.module.scss";
import CommonTypeEditor from "@/components/Workspace/CommonTypeEditor";

interface Props {
    disc: ParsedDiscData;
    onChange: (newType: string) => void;
}

const DiscTypeEditor: React.FC<Props> = (props) => {
    const { disc, onChange } = props;
    const { type } = disc || {};
    const [localType, setLocalType] = useState<string>(type || "");
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
                            // minWidth: "3rem",
                            // maxWidth: "calc(100vw - 2.88rem)",
                        }}
                        // onClick={(e) => {
                        //     // 阻止点击冒泡（防止点击候选项导致popover关闭)
                        //     e.stopPropagation();
                        // }}
                    >
                        <CommonTypeEditor
                            initialValue={localType}
                            onChange={onTypeChange}
                        />
                    </Card>
                }
                position="bottom-left"
                // modifiers={{
                //     preventOverflow: {
                //         enabled: false,
                //     },
                // }}
                onInteraction={(nextOpenState, e) => {
                    setIsShowInputCard(nextOpenState);
                }}
                targetTagName="div"
            >
                <div className={styles.popoverAnchor}></div>
            </Popover2>
            {type? (
                <>
                    <div
                        className={styles.secondaryActionText}
                        onClick={() => {
                            setIsShowInputCard(true);
                        }}
                    >
                        <span title="点击设置类型">
                            {type}
                        </span>
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
