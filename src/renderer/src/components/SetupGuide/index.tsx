import React, { useState } from "react";
import { Button, Text } from "@blueprintjs/core";
import { useAtom } from "jotai";
import { WorkspaceBasePathAtom } from "@/components/Workspace/state";
import Logger from "@/utils/log";
import NonEmptyDirectoryErrorDialog from "./NonEmptyDirectoryErrorDialog";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import styles from "./index.module.scss";

const SetupGuide: React.FC = () => {
    const [isShowNonEmptyErrorDialog, setIsShowNonEmptyErrorDialog] = useState(false);
    const [isShowCreateWorkspaceDialog, setIsShowCreateWorkspaceDialog] = useState(false);
    const [workspaceBasePath, setWorkspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const onMainButtonClick = async () => {
        const selected = await window.__native_bridge.dialog.open({
            properties: ["openDirectory"],
        });
        if (!selected) {
            return;
        }
        Logger.debug(`Workspace selected, workspace_path: ${selected}`);
        const anniWorkspaceConfigFilePath = await window.__native_bridge.path.resolve(selected[0], ".anni/config.toml");
        if (await window.__native_bridge.fs.exists(anniWorkspaceConfigFilePath)) {
            Logger.debug(`Existed workspace detected.`);
            // 一个已配置的 Anni Workspace 直接进入下一步
            setWorkspaceBasePath(selected[0]);
        } else {
            Logger.debug(`Try to create new workspace.`);
            // 未找到已存在的 Anni Workspace
            const entries = await window.__native_bridge.fs.readDir(selected[0]);
            if (entries.length > 0) {
                // 非空文件夹 - 异常
                setIsShowNonEmptyErrorDialog(true);
                return;
            }
            // 空文件夹 - 创建 Anni Workspace
            setIsShowCreateWorkspaceDialog(true);
            // TODO: 等待 Anni 接口
        }
    };
    return (
        <div className={styles.setupGuideContainer}>
            <div className={styles.buttonContainer} onClick={onMainButtonClick}>
                <Button>选择工作目录</Button>
            </div>
            <Text className={styles.helpText}>请选择 Anni 的工作目录</Text>
            <NonEmptyDirectoryErrorDialog
                isOpen={isShowNonEmptyErrorDialog}
                onClose={() => {
                    setIsShowNonEmptyErrorDialog(false);
                }}
            />
            <CreateWorkspaceDialog
                isOpen={isShowCreateWorkspaceDialog}
                onClose={() => {
                    setIsShowCreateWorkspaceDialog(false);
                }}
            />
        </div>
    );
};

export default SetupGuide;
