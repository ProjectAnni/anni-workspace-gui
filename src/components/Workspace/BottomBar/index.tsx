import React from "react";
import styles from "./index.module.scss";
import WorkspaceSwitch from "./WorkspaceSwitch";

const BottomBar: React.FC = () => {
    return (
        <div className={styles.bottomBar}>
            <WorkspaceSwitch />
        </div>
    );
};

export default BottomBar;
