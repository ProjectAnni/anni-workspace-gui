import React from "react";
import { useAtomValue } from "jotai";
import AlbumEditor from "./AlbumEditor";
import Header from "./Header";
import { OpenedDocumentAtom } from "../state";
import styles from "./index.module.scss";

const MainEditor: React.FC = () => {
    const openedDocument = useAtomValue(OpenedDocumentAtom);
    const { path: albumTomlPath } = openedDocument || {};

    return (
        <div className={styles.editor}>
            <Header />
            <AlbumEditor key={albumTomlPath} />
        </div>
    );
};

export default MainEditor;
