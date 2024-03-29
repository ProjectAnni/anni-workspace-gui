import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { useAtom } from "jotai";
import { Button, Icon, Intent } from "@blueprintjs/core";
import { searchFile } from "@/utils/file";
import Logger from "@/utils/log";
import { AppToaster } from "@/utils/toaster";
import { OpenedDocumentAtom, OpenedDocumentType, WorkspaceBasePathAtom, WorkspaceRepoConfigAtom } from "../../state";
import { getWorkspaceAlbums, publishAlbum } from "../services";
import { WorkspaceAlbum, WorkspaceState } from "../../types";
import styles from "./index.module.scss";
import PublishProgressDialog from "./PublishProgressDialog";

const ALBUM_INFO_REGEX =
    /\[(?<Year>\d{4}|\d{2})-?(?<Month>\d{2})-?(?<Date>\d{2})]\[(?<Catalog>[^\]]+)] (?<Name>.+?)(?:【(?<Edition>[^】]+)】)?(?: \[(?<DiscCount>\d+) Discs])?$/i;

interface PublishOptions {
    onSuccess?: (albumPath: string) => void;
    onError?: (albumPath: string, e: Error) => void;
}

const WorkspaceStatus: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    const [workspaceAlbums, setWorkspaceAlbums] = useState<WorkspaceAlbum[]>([]);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const [publishingPath, setPublishingPath] = useState("");
    const [publishStatus, setPublishStatus] = useState<{ current: number; total: number }>({ current: 0, total: 1 });
    const [isShowPublishProgressDialog, setIsShowPublishProgressDialog] = useState(false);
    const unlistenFunctionRef = useRef<() => void>();
    const isInitialized = useRef(false);
    const publishLock = useRef(false);

    const committedAlbums = useMemo(() => {
        if (!workspaceAlbums?.length) {
            return [];
        }
        return workspaceAlbums.filter((album) => album.type === WorkspaceState.COMMITTED);
    }, [workspaceAlbums]);

    const refreshWorkspaceStatus = useCallback(async () => {
        if (!workspaceBasePath) {
            return;
        }
        Logger.info("Workspace status change, refresh.");
        const result = await getWorkspaceAlbums(workspaceBasePath);

        setWorkspaceAlbums((oldAlbums) => {
            const newAlbums = result.filter((album) => !oldAlbums.some((a) => a.path === album.path));
            return [...oldAlbums, ...newAlbums.sort((a, b) => (a.path > b.path ? 1 : -1))];
        });
    }, [workspaceBasePath]);

    const publish = useCallback(
        async (albumPath: string, options?: PublishOptions) => {
            const { onSuccess, onError } = options || {};
            if (publishLock.current) {
                return;
            }
            publishLock.current = true;
            setPublishingPath(albumPath);
            try {
                await publishAlbum(workspaceBasePath, albumPath);
                onSuccess && onSuccess(albumPath);
            } catch (e) {
                if (e instanceof Error) {
                    Logger.error(
                        `Failed to publish album, error: ${e.message}, workspacePath: ${workspaceBasePath}, albumPath: ${albumPath}`
                    );
                    AppToaster.show({ message: e.message, intent: Intent.DANGER });
                    onError && onError(albumPath, e);
                }
            } finally {
                setPublishingPath("");
                publishLock.current = false;
            }
        },
        [workspaceBasePath]
    );

    useEffect(() => {
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;
        unlistenFunctionRef.current = window.__native_bridge.events.onWorkspaceStatusChange(refreshWorkspaceStatus);
        return () => {
            unlistenFunctionRef.current && unlistenFunctionRef.current();
        };
    }, [refreshWorkspaceStatus]);

    const onFileClick = useCallback(
        async (catalog: string) => {
            if (!repoConfig?.albumPaths?.length) {
                return;
            }
            const tomlPath = await searchFile(repoConfig.albumPaths, `${catalog}.toml`);
            if (tomlPath) {
                setOpenedDocument({ path: tomlPath, label: catalog, type: OpenedDocumentType.ALBUM });
            }
        },
        [repoConfig, setOpenedDocument]
    );

    const onPublish = async (albumPath: string) => {
        publish(albumPath);
    };

    const onPublishAll = async () => {
        if (!committedAlbums?.length) {
            return;
        }
        setPublishStatus({ current: 0, total: committedAlbums.length });
        setIsShowPublishProgressDialog(true);
        let errorFlag = false;
        for (const album of committedAlbums) {
            if (errorFlag) {
                break;
            }
            await publish(album.path, {
                onSuccess: () => {
                    setPublishStatus((prevStatus) => ({ ...prevStatus, current: prevStatus.current + 1 }));
                },
                onError: () => {
                    errorFlag = true;
                },
            });
        }
        setIsShowPublishProgressDialog(false);
    };

    useEffect(() => {
        refreshWorkspaceStatus();
    }, [workspaceBasePath, refreshWorkspaceStatus]);

    return (
        <div className={styles.workspaceStatusContainer}>
            {!!committedAlbums?.length && (
                <div className={styles.workspaceActions}>
                    <Button
                        icon="git-push"
                        text="发布全部"
                        small
                        minimal
                        intent={Intent.PRIMARY}
                        disabled={!!publishingPath}
                        onClick={onPublishAll}
                    ></Button>
                    <PublishProgressDialog
                        current={publishStatus.current}
                        total={publishStatus.total}
                        isOpen={isShowPublishProgressDialog}
                    />
                </div>
            )}
            <div className={styles.fileList}>
                {committedAlbums.map((album, index) => {
                    const { album_id: albumId, path, type } = album;
                    const { Catalog: catalog } = path.match(ALBUM_INFO_REGEX)?.groups || {};
                    const isPublishing = path === publishingPath;
                    return (
                        <div
                            key={albumId}
                            className={classNames(styles.fileNode, {
                                [styles.selected]: openedDocument.label === catalog,
                                [styles.publishing]: isPublishing,
                            })}
                            onClick={() => {
                                onFileClick(catalog);
                            }}
                        >
                            <Icon icon="document" />
                            <div className={styles.nodeLabel}>{catalog}</div>
                            <div className={styles.status}>{type}</div>
                            <div className={styles.actions}>
                                <Button
                                    text="发布"
                                    className={styles.actionButton}
                                    loading={isPublishing}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onPublish(path);
                                    }}
                                ></Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorkspaceStatus;
