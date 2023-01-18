import React from "react";
import { Button, ButtonGroup, Divider, Intent } from "@blueprintjs/core";
import { ParsedDiscData } from "@/types/album";
import styles from "./index.module.scss";

interface Props {
    disc: ParsedDiscData;
    index: number;
}

const DiscInfoEditor: React.FC<Props> = (props) => {
    const { disc, index } = props;
    const { title, catalog } = disc;
    return (
        <>
            <div className={styles.discTitleContainer}>
                <div className={styles.discTitle}>
                    {`Disc #${(index + 1).toString().padStart(2, "0")}${
                        title ? ` - ${title}` : ""
                    }`}
                </div>
                <div className={styles.catalog}>{catalog}</div>
                <div className={styles.spacer} />
                <div className={styles.actions}>
                    <ButtonGroup minimal>
                        <Button text="设置艺术家" small />
                        <Divider />
                        <Button text="删除" small intent={Intent.DANGER} />
                    </ButtonGroup>
                </div>
            </div>
        </>
    );
};

export default DiscInfoEditor;
