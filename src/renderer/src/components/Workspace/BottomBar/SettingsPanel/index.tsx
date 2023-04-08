import React, { useState } from "react";
import { Dialog, DialogBody, Icon, Tab, Tabs } from "@blueprintjs/core";
import GeneralSettings from "./GeneralSettings";
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
                <DialogBody>
                    <Tabs vertical large>
                        <Tab id="general" panel={<GeneralSettings />} title="通用"></Tab>
                        <Tab id="external" panel={<>22</>} title="外部"></Tab>
                    </Tabs>
                </DialogBody>
            </Dialog>
        </>
    );
};

export default SettingsPanel;
