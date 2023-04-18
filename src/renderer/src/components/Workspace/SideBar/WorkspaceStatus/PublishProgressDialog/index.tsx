import React from "react";
import { Dialog, DialogBody, Intent, ProgressBar } from "@blueprintjs/core";
import styles from "./index.module.scss";

interface Props {
    current: number;
    total: number;
    isOpen: boolean;
}

const PublishProgressDialog: React.FC<Props> = (props) => {
    const { current, total, isOpen } = props;
    const progress = current / total;
    return (
        <Dialog
            title="正在发布"
            isOpen={isOpen}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
            isCloseButtonShown={false}
        >
            <DialogBody>
                <ProgressBar value={progress} intent={Intent.PRIMARY} stripes={false} />
                <div className={styles.progressText}>
                    {current} / {total}
                </div>
            </DialogBody>
        </Dialog>
    );
};

export default PublishProgressDialog;
