import React, { useState } from "react";
import { useAtom } from "jotai";
import { WorkspaceBasePathAtom } from "@/components/Workspace/state";
import styles from "./index.module.scss";
import { Alert, Intent } from "@blueprintjs/core";
import { useRepository } from "../../context";

const WorkspaceSwitch: React.FC = () => {
    const [workspaceBasePath, setWorkspaceBasePath] = useAtom(
        WorkspaceBasePathAtom
    );
    const repoConfig = useRepository();
    const [isShowConfirmDialog, setIsShowConfirmDialog] = useState(false);
    const { name } = repoConfig || {};
    const onClick = () => {
        setIsShowConfirmDialog(true);
    };
    return (
        <>
            <div className={styles.workspaceSwitch} onClick={onClick}>
                <span>{name}</span>
            </div>
            <Alert
                isOpen={isShowConfirmDialog}
                cancelButtonText="取消"
                confirmButtonText="切换工作空间"
                intent={Intent.DANGER}
                onClose={() => {
                    setIsShowConfirmDialog(false);
                }}
                onConfirm={() => {
                    setWorkspaceBasePath("");
                }}
            >
                确认切换工作空间？未保存的更改将会丢失
            </Alert>
        </>
    );
};

export default WorkspaceSwitch;
