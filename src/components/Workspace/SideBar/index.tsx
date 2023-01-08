import React, { Suspense } from "react";
import AlbumDirectory from "./AlbumDirectory";
import styles from "./index.module.scss";

const SideBar: React.FC = () => {
    return (
        <div className={styles.sideBar}>
            <AlbumDirectory />
        </div>
    );
};

export default SideBar;
