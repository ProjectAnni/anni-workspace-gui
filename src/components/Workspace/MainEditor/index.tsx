import React from "react";
import { useAtomValue } from "jotai";
import AlbumEditor from "./AlbumEditor";
import Header from "./Header";
import { OpenedDocumentAtom, OpenedDocumentType } from "../state";
import styles from "./index.module.scss";

const MainEditor: React.FC = () => {
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const { path: albumTomlPath, type } = openedDocument || {};

    return (
        <div className={styles.editor}>
            <Header />
            {type === OpenedDocumentType.ALBUM && <AlbumEditor key={albumTomlPath} />}
        </div>
    );
};

export default MainEditor;
