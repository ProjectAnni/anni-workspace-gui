import React, { useState } from "react";
import { useAtom } from "jotai";
import { WorkspaceBasePathAtom } from "@/state/workspace";
import styles from "./index.module.scss";
import { Alert, Intent } from "@blueprintjs/core";

const WorkspaceSwitch: React.FC = () => {
    const [workspaceBasePath, setWorkspaceBasePath] = useAtom(
        WorkspaceBasePathAtom
    );
    const [isShowConfirmDialog, setIsShowConfirmDialog] = useState(false);
    const onClick = () => {
        setIsShowConfirmDialog(true);
    };
    return (
        <>
            <div className={styles.workspaceSwitch} onClick={onClick}>
                <span>{workspaceBasePath}</span>
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
