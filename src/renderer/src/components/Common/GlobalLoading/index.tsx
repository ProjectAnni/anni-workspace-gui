import React from "react";
import { Dialog, DialogBody, Spinner } from "@blueprintjs/core";
import styles from "./index.module.scss";

interface Props {
    isOpen: boolean;
    text?: string;
}

const GlobalLoading: React.FC<Props> = (props) => {
    const { isOpen, text } = props;
    return (
        <Dialog isOpen={isOpen} className={styles.spinnerDialog}>
            <DialogBody>
                <div className={styles.spinnerContainer}>
                    <Spinner size={32} />
                    <div className={styles.text}>{text}</div>
                </div>
            </DialogBody>
        </Dialog>
    );
};

export default GlobalLoading;
