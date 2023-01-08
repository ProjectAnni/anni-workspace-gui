import React, { Suspense } from "react";
import styles from "./index.module.scss";
import WorkspaceSwitch from "./WorkspaceSwitch";

const BottomBar: React.FC = () => {
    return (
        <div className={styles.bottomBar}>
            <Suspense>
                <WorkspaceSwitch />
            </Suspense>
        </div>
    );
};

export default BottomBar;
