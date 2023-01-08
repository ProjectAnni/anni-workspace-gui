import React, { useState } from "react";
import { Button, Text } from "@blueprintjs/core";
import { useAtom } from "jotai";
import { open } from "@tauri-apps/api/dialog";
import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import { WorkspaceBasePathAtom } from "@/components/Workspace/state";
import NonEmptyDirectoryErrorDialog from "./NonEmptyDirectoryErrorDialog";
import CreateWorkspaceDialog from "./CreateWorkspaceDialog";
import styles from "./index.module.scss";

const SetupGuide: React.FC = () => {
    const [isShowNonEmptyErrorDialog, setIsShowNonEmptyErrorDialog] =
        useState(false);
    const [isShowCreateWorkspaceDialog, setIsShowCreateWorkspaceDialog] =
        useState(false);
    const [workspaceBasePath, setWorkspaceBasePath] = useAtom(
        WorkspaceBasePathAtom
    );
    const onMainButtonClick = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
        });
        if (!selected) {
            return;
        }
        const anniWorkspaceConfigFilePath = await path.resolve(
            selected as string,
            ".anni/config.toml"
        );
        if (await fs.exists(anniWorkspaceConfigFilePath)) {
            // 一个已配置的 Anni Workspace 直接进入下一步
            setWorkspaceBasePath(selected as string);
        } else {
            // 未找到已存在的 Anni Workspace
            const entries = await fs.readDir(selected as string);
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
