import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtom } from "jotai";
import { fs, path, invoke } from "@tauri-apps/api";
import { Intent } from "@blueprintjs/core";
import { useFileDrop } from "@/hooks/useFileDrop";
import { AppToaster } from "@/utils/toaster";
import { WorkspaceBasePathAtom } from "../Workspace/state";
import { copyDirectory } from "@/utils/file";
import Logger from "@/utils/log";
import BasicInfoEditDialog from "./BasicInfoEditDialog";
import CoverConfirmDialog from "./CoverConfirmDialog";
import { createWorkspaceAlbum, prepareCommitWorkspaceAlbum, standardizeAlbumDirectoryName } from "./services";
import GlobalLoading from "../Common/GlobalLoading";

const DiscImportGuide: React.FC = () => {
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const [releaseDate, setReleaseDate] = useState("");
    const [catalog, setCatalog] = useState("");
    const [albumName, setAlbumName] = useState("");
    const [edition, setEdition] = useState("");
    const [originDirectoryName, setOriginDirectoryName] = useState("");
    const [originDirectoryPath, setOriginDirectoryPath] = useState("");
    const [workingDirectoryName, setWorkingDirectoryName] = useState("");
    const [workingDirectoryPath, setWorkingDirectoryPath] = useState("");
    const [isShowBasicInfoEditDialog, setIsShowBasicInfoEditDialog] = useState(false);
    const [isShowCoverConfirmDialog, setIsShowCoverConfirmDialog] = useState(false);
    const [isShowGlobalLoading, setIsShowGlobalLoading] = useState(false);
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
                const destination = await path.resolve(workspaceBasePath, dirname);
                await copyDirectory(filePath, destination);
                AppToaster.show({
                    message: "已导入工作空间",
                    intent: Intent.SUCCESS,
                });
                setOriginDirectoryName(dirname);
                setWorkingDirectoryName(dirname);
                setOriginDirectoryPath(filePath);
                setWorkingDirectoryPath(destination);
                setIsShowBasicInfoEditDialog(true);
            } catch (e) {
                if (e instanceof Error) {
                    AppToaster.show({
                        message: `导入失败: ${e.message}`,
                        intent: Intent.DANGER,
                    });
                }
                processLock.current = false;
                return;
            }
        },
        [workspaceBasePath]
    );

    const onBasicInfoConfirm = useCallback(
        async (newReleaseDate: string, newCatalog: string, newAlbumName: string, newEdition?: string) => {
            // TODO: 多Disc情况下允许用户选择哪个是Disc 1哪个是Disc2
            // TODO: 允许用户为不同Disc选择不同封面
            // 先简单做，只能同一个封面 放在album/cover.jpg
            setReleaseDate(newReleaseDate);
            setCatalog(newCatalog);
            setAlbumName(newAlbumName);
            if (newEdition) {
                setEdition(newEdition);
            }
            try {
                const result = await standardizeAlbumDirectoryName(workingDirectoryPath, {
                    date: newReleaseDate,
                    title: newAlbumName,
                    catalog: newCatalog,
                    edition: newEdition,
                });
                Logger.debug(`Album directory renamed to: ${result}`);
                const newDirectoryName = await path.basename(result);
                setWorkingDirectoryName(newDirectoryName);
                setWorkingDirectoryPath(result);
            } catch (e) {
                if (e instanceof Error) {
                    AppToaster.show({ message: e.message, intent: Intent.DANGER });
                }
                processLock.current = false;
                return;
            }
            setIsShowBasicInfoEditDialog(false);
            setIsShowCoverConfirmDialog(true);
        },
        [workingDirectoryPath]
    );

    const onCoverConfirm = useCallback(async () => {
        setIsShowGlobalLoading(true);
        try {
            await createWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
            const prepareResult = await prepareCommitWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
            console.log(prepareResult);
        } catch (e) {
            if (e instanceof Error) {
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
        } finally {
            processLock.current = false;
        }
    }, [workspaceBasePath, workingDirectoryPath]);

    useFileDrop({ onDrop: onFileDrop });

    return (
        <>
            <BasicInfoEditDialog
                isOpen={isShowBasicInfoEditDialog}
                workingDirectoryName={workingDirectoryName}
                onClose={() => {
                    setIsShowBasicInfoEditDialog(false);
                }}
                onConfirm={onBasicInfoConfirm}
            />
            <CoverConfirmDialog
                isOpen={isShowCoverConfirmDialog}
                workingDirectoryPath={workingDirectoryPath}
                albumName={albumName}
                onClose={() => {
                    setIsShowCoverConfirmDialog(false);
                }}
                onConfirm={onCoverConfirm}
            />
            <GlobalLoading isOpen={isShowGlobalLoading} text="处理中..." />
        </>
    );
};

export default DiscImportGuide;
