import { useState } from "react";
import { Card, InputGroup } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedDiscData } from "@/types/album";
import styles from "./index.module.scss";

interface Props {
    disc: ParsedDiscData;
    index: number;
    onChange: (newTitle: string) => void;
}

const DiscTitleEditor: React.FC<Props> = (props) => {
    const { disc, index, onChange } = props;
    const { title } = disc;
    const [isShowTitleInputCard, setIsShowTitleInputCard] = useState(false);
    const [localTitle, setLocalTitle] = useState(title || "");

    const onDiscTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalTitle(e.target.value);
    };

    const onDiscTitleInputKeydown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setIsShowTitleInputCard(false);
        }
    };

    const onDiscTitleInputBlur = () => {
        onChange(localTitle);
        setIsShowTitleInputCard(false);
    }

    const onDiscTitleInputClose = () => {
        onChange(localTitle);
    };

    return (
        <Popover2
            isOpen={isShowTitleInputCard}
            content={
                <Card className={styles.inputCard}>
                    <InputGroup
                        autoFocus
                        placeholder="设置碟片标题..."
                        value={localTitle}
                        onChange={onDiscTitleChange}
                        onBlur={onDiscTitleInputBlur}
                        onKeyDown={onDiscTitleInputKeydown}
                    />
                </Card>
            }
            minimal
            position="bottom"
            onClose={onDiscTitleInputClose}
        >
            <div
                className={styles.discTitle}
                onClick={() => {
                    setIsShowTitleInputCard(true);
                }}
            >
                <span title="点击设置标题">{`Disc #${(index + 1)
                    .toString()
                    .padStart(2, "0")}${title ? ` - ${title}` : ""}`}</span>
            </div>
        </Popover2>
    );
};

export default DiscTitleEditor;
