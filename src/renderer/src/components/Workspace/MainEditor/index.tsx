import React from "react";
import { useAtomValue } from "jotai";
import AlbumEditor from "./AlbumEditor";
import Header from "./Header";
import { OpenedDocumentAtom, OpenedDocumentType } from "../state";
import styles from "./index.module.scss";
import TagEditor from "./TagEditor";

const MainEditor: React.FC = () => {
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const { path: openedDocumentPath, type } = openedDocument || {};

    return (
        <div className={styles.editor}>
            <Header />
            {type === OpenedDocumentType.ALBUM && <AlbumEditor key={openedDocumentPath} />}
            {type === OpenedDocumentType.TAG && <TagEditor key={openedDocumentPath} />}
        </div>
    );
};

export default MainEditor;
