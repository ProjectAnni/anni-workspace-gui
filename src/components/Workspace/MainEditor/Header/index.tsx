import React from "react";
import { useAtomValue } from "jotai";
import { OpenedDocumentAtom } from "../../state";
import styles from "./index.module.scss";

const Header: React.FC = () => {
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const { label } = openedDocument || {};
    return null;
    return (
        <div className={styles.header}>
            <div className={styles.currentFileInfo}>
                <span>{label}</span>
            </div>
        </div>
    );
};

export default Header;
