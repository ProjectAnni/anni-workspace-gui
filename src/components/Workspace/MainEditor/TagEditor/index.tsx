import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import { NonIdealState } from "@blueprintjs/core";
import { OpenedDocumentAtom } from "../../state";
import styles from "./index.module.scss";

const TagEditor: React.FC = () => {
    const openedDocument = useAtomValue(OpenedDocumentAtom);

    return (
        <div className={styles.tagEditor}>
            <NonIdealState title="没想好咋做" />
        </div>
    );
};

export default TagEditor;
