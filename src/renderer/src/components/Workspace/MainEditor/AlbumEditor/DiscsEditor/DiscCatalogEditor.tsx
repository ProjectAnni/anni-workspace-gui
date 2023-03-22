import { useState } from "react";
import { Card, InputGroup } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedDiscData } from "@/types/album";
import styles from "./index.module.scss";

interface Props {
    disc: ParsedDiscData;
    onChange: (newCatalog: string) => void;
}

const DiscCatalogEditor: React.FC<Props> = (props) => {
    const { disc, onChange } = props;
    const { catalog } = disc;
    const [isShowCatalogInputCard, setIsShowCatalogInputCard] = useState(false);
    const [localCatalog, setLocalCatalog] = useState(catalog || "");

    const onDiscCatalogChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalCatalog(e.target.value);
    };

    const onDiscCatalogInputKeydown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        if (e.key === "Enter" || e.key === "Escape") {
            setIsShowCatalogInputCard(false);
        }
    };

    const onDiscCatalogInputBlur = () => {
        onChange(localCatalog);
        setIsShowCatalogInputCard(false);
    };

    const onDiscCatalogInputClose = () => {
        onChange(localCatalog);
    };

    return (
        <Popover2
            isOpen={isShowCatalogInputCard}
            content={
                <Card className={styles.inputCard}>
                    <InputGroup
                        autoFocus
                        placeholder="设置碟片品番..."
                        value={localCatalog}
                        onChange={onDiscCatalogChange}
                        onKeyDown={onDiscCatalogInputKeydown}
                        onBlur={onDiscCatalogInputBlur}
                    />
                </Card>
            }
            minimal
            position="bottom"
            onClose={onDiscCatalogInputClose}
        >
            <div
                className={styles.catalog}
                onClick={() => {
                    setIsShowCatalogInputCard(true);
                }}
            >
                <span title="点击设置品番">{catalog}</span>
            </div>
        </Popover2>
    );
};

export default DiscCatalogEditor;
