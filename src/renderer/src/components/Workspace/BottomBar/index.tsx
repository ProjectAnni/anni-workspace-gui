import React, { Suspense } from "react";
import styles from "./index.module.scss";
import SettingsPanel from "./SettingsPanel";
import WorkspaceSwitch from "./WorkspaceSwitch";

const BottomBar: React.FC = () => {
    return (
        <div className={styles.bottomBar}>
            <Suspense>
                <SettingsPanel />
                <WorkspaceSwitch />
            </Suspense>
        </div>
    );
};

export default BottomBar;
