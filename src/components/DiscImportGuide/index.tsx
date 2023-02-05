import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { fs, path } from "@tauri-apps/api";
import { Intent } from "@blueprintjs/core";
import { useFileDrop } from "@/hooks/useFileDrop";
import { AppToaster } from "@/utils/toaster";
import { WorkspaceBasePathAtom } from "../Workspace/state";
import { copyDirectory } from "@/utils/file";
import BasicInfoEditDialog from "./BasicInfoEditDialog";

const DiscImportGuide: React.FC = () => {
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const [workingDirectoryName, setWorkingDirectoryName] = useState("");
    const [workingDirectoryPath, setWorkingDirectoryPath] = useState("");
    const [isShowBasicInfoEditDialog, setIsShowBasicInfoEditDialog] = useState(false);
    const processLock = useRef(false);
    const onFileDrop = useCallback(
        async (filePath: string) => {
            if (processLock.current) {
                return;
            }
            processLock.current = true;
            try {
                const dir = await fs.readDir(filePath);
                const dirname = await path.basename(filePath);
                if (!dir.length) {
                    // 空文件夹
                    AppToaster.show({
                        message: "导入失败: 文件夹为空",
                        intent: Intent.DANGER,
                    });
                    return;
                }
                // if (!dir.every((entry) => !!entry.children) && dir.some((entry) => !!entry.children)) {
                //     // 多Disc，但目录下除子文件夹还有其他文件，无法判断
                //     // TODO: 人工确认清理？
                //     AppToaster.show({
                //         message: "导入失败: 文件夹结构存在歧义",
                //         intent: Intent.DANGER,
                //     });
                //     return;
                // }
                AppToaster.show({ message: "复制文件.." });
                await copyDirectory(filePath, await path.resolve(workspaceBasePath, dirname));
                AppToaster.show({
                    message: "已导入工作空间",
                    intent: Intent.SUCCESS,
                });
                setWorkingDirectoryName(dirname);
                setWorkingDirectoryPath(filePath);
                setIsShowBasicInfoEditDialog(true);
            } catch (e) {
                console.log(e);
                if (e instanceof Error) {
                    AppToaster.show({
                        message: `导入失败: ${e.message}`,
                        intent: Intent.DANGER,
                    });
                    return;
                }
                AppToaster.show({ message: "导入失败", intent: Intent.DANGER });
            } finally {
                processLock.current = false;
            }
        },
        [workspaceBasePath]
    );

    useFileDrop({ onDrop: onFileDrop });

    return (
        <>
            <BasicInfoEditDialog isOpen={isShowBasicInfoEditDialog} workingDirectoryName={workingDirectoryName} />
        </>
    );
};

export default DiscImportGuide;
