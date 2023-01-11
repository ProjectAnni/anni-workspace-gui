import React from "react";
import AlbumEditor from "./AlbumEditor";
import Header from "./Header";
import styles from "./index.module.scss";

const MainEditor: React.FC = () => {
    return (
        <div className={styles.editor}>
            <Header />
            <AlbumEditor />
        </div>
    );
};

export default MainEditor;
