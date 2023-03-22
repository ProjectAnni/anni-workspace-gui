import React, { useCallback, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Intent } from "@blueprintjs/core";
import { useFileDrop } from "@/hooks/useFileDrop";
import { AppToaster } from "@/utils/toaster";
import { WorkspaceBasePathAtom, WorkspaceRepoConfigAtom } from "../Workspace/state";
import { copyDirectory, searchFile } from "@/utils/file";
import Logger from "@/utils/log";
import BasicInfoEditDialog from "./BasicInfoEditDialog";
import CoverConfirmDialog from "./CoverConfirmDialog";
import {
    commitWorkspaceAlbum,
    createWorkspaceAlbum,
    prepareCommitWorkspaceAlbum,
    standardizeAlbumDirectoryName,
} from "./services";
import GlobalLoading from "../Common/GlobalLoading";
import { WorkspaceDisc } from "../Workspace/types";
import CommitConfirmDialog from "./CommitConfirmDialog";

const DiscImportGuide: React.FC = () => {
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    const [releaseDate, setReleaseDate] = useState("");
    const [catalog, setCatalog] = useState("");
    const [albumName, setAlbumName] = useState("");
    const [edition, setEdition] = useState("");
    const [originDirectoryName, setOriginDirectoryName] = useState("");
    const [originDirectoryPath, setOriginDirectoryPath] = useState("");
    const [workingDirectoryName, setWorkingDirectoryName] = useState("");
    const [workingDirectoryPath, setWorkingDirectoryPath] = useState("");
    const [prepareResult, setPrepareResult] = useState<WorkspaceDisc[]>([]);
    const [isShowBasicInfoEditDialog, setIsShowBasicInfoEditDialog] = useState(false);
    const [isShowCoverConfirmDialog, setIsShowCoverConfirmDialog] = useState(false);
    const [isShowGlobalLoading, setIsShowGlobalLoading] = useState(false);
    const [isShowCommitConfirmDialog, setIsShowCommitConfirmDialog] = useState(false);
    const processLock = useRef(false);
    const onFileDrop = useCallback(
        async (filePath: string) => {
            if (processLock.current) {
                return;
            }
            processLock.current = true;
            try {
                const dir = await window.__native_bridge.fs.readDir(filePath);
                const dirname = await window.__native_bridge.path.basename(filePath);
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
                setIsShowGlobalLoading(true);
                AppToaster.show({ message: "复制文件.." });
                const destination = await window.__native_bridge.path.resolve(workspaceBasePath, dirname as string);
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
            } finally {
                setIsShowGlobalLoading(false);
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
            if (await searchFile(repoConfig?.albumPaths || [], `${newCatalog}.toml`)) {
                Logger.error(`Duplicated catalog: ${newCatalog}`);
                AppToaster.show({ message: "已存在该品番的专辑", intent: Intent.DANGER });
                processLock.current = false;
                return;
            }
            try {
                const result = await standardizeAlbumDirectoryName(workingDirectoryPath, {
                    date: newReleaseDate,
                    title: newAlbumName,
                    catalog: newCatalog,
                    edition: newEdition,
                });
                Logger.debug(`Album directory renamed to: ${result}`);
                const newDirectoryName = await window.__native_bridge.path.basename(result);
                setWorkingDirectoryName(newDirectoryName);
                setWorkingDirectoryPath(result);
            } catch (e) {
                if (e instanceof Error) {
                    Logger.error(
                        `Failed to standardize album directory, error: ${e.message}, albumPath: ${workingDirectoryPath}`
                    );
                    AppToaster.show({ message: e.message, intent: Intent.DANGER });
                }
                processLock.current = false;
                return;
            }
            setIsShowBasicInfoEditDialog(false);
            setIsShowCoverConfirmDialog(true);
        },
        [workingDirectoryPath, repoConfig]
    );

    const onBasicInfoEditClose = useCallback(() => {
        setIsShowBasicInfoEditDialog(false);
        processLock.current = false;
    }, []);

    const onCoverConfirm = useCallback(async () => {
        setIsShowGlobalLoading(true);
        setIsShowCoverConfirmDialog(false);
        try {
            await createWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
            const prepareResult = await prepareCommitWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
            setPrepareResult(prepareResult);
            setIsShowCommitConfirmDialog(true);
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(
                    `Failed to create or prepare commit album, error: ${e.message}, albumPath: ${workingDirectoryPath}`
                );
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
            processLock.current = false;
        } finally {
            setIsShowGlobalLoading(false);
        }
    }, [workspaceBasePath, workingDirectoryPath]);

    const onCoverConfirmClose = useCallback(() => {
        setIsShowCoverConfirmDialog(false);
        processLock.current = false;
    }, []);

    const onCommitConfirm = useCallback(async () => {
        setIsShowGlobalLoading(true);
        setIsShowCommitConfirmDialog(false);
        try {
            await commitWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(`Failed to commit album, error: ${e.message}, albumPath: ${workingDirectoryPath}`);
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
        } finally {
            setIsShowGlobalLoading(false);
            processLock.current = false;
        }
    }, [workspaceBasePath, workingDirectoryPath]);

    const onCommitConfirmClose = useCallback(() => {
        setIsShowCommitConfirmDialog(false);
        processLock.current = false;
    }, []);

    useFileDrop({ onDrop: onFileDrop });

    return (
        <React.Fragment key={originDirectoryPath}>
            <BasicInfoEditDialog
                isOpen={isShowBasicInfoEditDialog}
                workingDirectoryName={workingDirectoryName}
                onClose={onBasicInfoEditClose}
                onConfirm={onBasicInfoConfirm}
            />
            <CoverConfirmDialog
                isOpen={isShowCoverConfirmDialog}
                workingDirectoryPath={workingDirectoryPath}
                albumName={albumName}
                onClose={onCoverConfirmClose}
                onConfirm={onCoverConfirm}
            />
            <CommitConfirmDialog
                isOpen={isShowCommitConfirmDialog}
                discs={prepareResult}
                onClose={onCommitConfirmClose}
                onConfirm={onCommitConfirm}
            />
            <GlobalLoading isOpen={isShowGlobalLoading} text="处理中..." />
        </React.Fragment>
    );
};

export default DiscImportGuide;
