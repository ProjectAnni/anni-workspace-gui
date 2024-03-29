import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { Intent } from "@blueprintjs/core";
import { AppToaster } from "@/utils/toaster";
import { WorkspaceBasePathAtom, WorkspaceRepoConfigAtom } from "../Workspace/state";
import { copyDirectory, searchFile } from "@/utils/file";
import Logger from "@/utils/log";
import EventBus from "@/utils/event_bus";
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
import InterruptConfirmDialog from "./InterruptConfirmDialog";
import FileDropMask from "./FileDropMask";
import {
    ALBUM_COMMITTED_EVENT,
    ALBUM_DIRECTORY_DROP_EVENT,
    ALBUM_IMPORT_ERROR_EVENT,
    ALBUM_IMPORT_INTERRUPT_EVENT,
} from "./constants";

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
    const [isShowInterruptConfirmDialog, setIsShowInterruptConfirmDialog] = useState(false);
    const processLock = useRef(false);

    const onAlbumDirectoryDrop = useCallback(
        async (payload?: { filePath?: string }) => {
            const { filePath } = payload || {};
            if (processLock.current || !filePath) {
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
                EventBus.send(ALBUM_IMPORT_ERROR_EVENT);
                processLock.current = false;
                return;
            }
            setIsShowBasicInfoEditDialog(false);
            setIsShowCoverConfirmDialog(true);
        },
        [workingDirectoryPath, repoConfig]
    );

    const onBasicInfoEditClose = useCallback(() => {
        setIsShowInterruptConfirmDialog(true);
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
            EventBus.send(ALBUM_IMPORT_ERROR_EVENT);
            processLock.current = false;
        } finally {
            setIsShowGlobalLoading(false);
        }
    }, [workspaceBasePath, workingDirectoryPath]);

    const onCoverConfirmClose = useCallback(() => {
        setIsShowInterruptConfirmDialog(true);
    }, []);

    const onCommitConfirm = useCallback(async () => {
        setIsShowGlobalLoading(true);
        setIsShowCommitConfirmDialog(false);
        try {
            await commitWorkspaceAlbum(workspaceBasePath, workingDirectoryPath);
            EventBus.send(ALBUM_COMMITTED_EVENT);
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(`Failed to commit album, error: ${e.message}, albumPath: ${workingDirectoryPath}`);
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
            EventBus.send(ALBUM_IMPORT_ERROR_EVENT);
        } finally {
            setIsShowGlobalLoading(false);
            processLock.current = false;
        }
    }, [workspaceBasePath, workingDirectoryPath]);

    const onCommitConfirmClose = useCallback(() => {
        setIsShowInterruptConfirmDialog(true);
    }, []);

    const onInterruptConfirmClose = useCallback(() => {
        setIsShowInterruptConfirmDialog(false);
    }, []);

    const onInterruptConfirmCancel = useCallback(() => {
        setIsShowInterruptConfirmDialog(false);
        setIsShowBasicInfoEditDialog(false);
        setIsShowCoverConfirmDialog(false);
        setIsShowCommitConfirmDialog(false);
        EventBus.send(ALBUM_IMPORT_INTERRUPT_EVENT);
        processLock.current = false;
    }, []);

    const onInterruptConfirmConfirm = useCallback(async () => {
        setIsShowGlobalLoading(true);
        try {
            Logger.info(`Disc import interrupted, clean up working directory: albumPath: ${workingDirectoryPath}`);
            await window.__native_bridge.fs.deleteDirectory(workingDirectoryPath);
            setIsShowInterruptConfirmDialog(false);
            setIsShowBasicInfoEditDialog(false);
            setIsShowCoverConfirmDialog(false);
            setIsShowCommitConfirmDialog(false);
            EventBus.send(ALBUM_IMPORT_INTERRUPT_EVENT);
            processLock.current = false;
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(
                    `Failed to delete album working directory, error: ${e.message}, albumPath: ${workingDirectoryPath}`
                );
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
            EventBus.send(ALBUM_IMPORT_ERROR_EVENT);
        } finally {
            setIsShowGlobalLoading(false);
        }
    }, [workingDirectoryPath]);

    useEffect(() => {
        const unlisten = EventBus.addEventListener<{ filePath: string }>(
            ALBUM_DIRECTORY_DROP_EVENT,
            onAlbumDirectoryDrop
        );

        return () => {
            unlisten();
        };
    }, [onAlbumDirectoryDrop]);

    return (
        <React.Fragment key={originDirectoryPath}>
            <FileDropMask />
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
            <InterruptConfirmDialog
                isOpen={isShowInterruptConfirmDialog}
                workingDirectoryPath={workingDirectoryPath}
                onClose={onInterruptConfirmClose}
                onCancel={onInterruptConfirmCancel}
                onConfirm={onInterruptConfirmConfirm}
            />
            <GlobalLoading isOpen={isShowGlobalLoading} text="处理中..." />
        </React.Fragment>
    );
};

export default DiscImportGuide;
