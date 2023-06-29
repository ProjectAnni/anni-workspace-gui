import React, { useState } from "react";
import { Dialog, DialogBody, Icon, Tab, Tabs } from "@blueprintjs/core";
import GeneralSettings from "./GeneralSettings";
import AssistantFeaturePanel from "../AssistantFeaturePanel";
import WorkspaceSettings from "./WorkspaceSettings";
import styles from "./index.module.scss";

const SettingsPanel: React.FC = () => {
    const [isShowPanel, setIsShowPanel] = useState(false);
    return (
        <>
            <div
                className={styles.entry}
                onClick={() => {
                    setIsShowPanel(true);
                }}
            >
                <Icon icon="settings" size={12} />
            </div>
            <Dialog
                isOpen={isShowPanel}
                style={{ width: "60vw", minHeight: "400px" }}
                title="设置"
                onClose={() => {
                    setIsShowPanel(false);
                }}
            >
                <DialogBody className={styles.content}>
                    <Tabs vertical large>
                        <Tab id="general" panel={<GeneralSettings />} title="通用" className={styles.panel}></Tab>
                        <Tab id="workspace" panel={<WorkspaceSettings />} title="工作空间" className={styles.panel}></Tab>
                        <Tab
                            id="external"
                            panel={<AssistantFeaturePanel />}
                            title="辅助功能"
                            className={styles.panel}
                        ></Tab>
                    </Tabs>
                </DialogBody>
            </Dialog>
        </>
    );
};

export default SettingsPanel;
