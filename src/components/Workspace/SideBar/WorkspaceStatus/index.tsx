import React, { useCallback, useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { useAtom } from "jotai";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Button, Icon, Intent } from "@blueprintjs/core";
import { searchFile } from "@/utils/file";
import Logger from "@/utils/log";
import { AppToaster } from "@/utils/toaster";
import { OpenedDocumentAtom, OpenedDocumentType, WorkspaceBasePathAtom, WorkspaceRepoConfigAtom } from "../../state";
import { getWorkspaceAlbums, publishAlbum } from "../services";
import { WorkspaceAlbum, WorkspaceState } from "../../types";
import styles from "./index.module.scss";

const ALBUM_INFO_REGEX =
    /\[(?<Year>\d{4}|\d{2})-?(?<Month>\d{2})-?(?<Date>\d{2})]\[(?<Catalog>[^\]]+)] (?<Name>.+?)(?:【(?<Edition>[^】]+)】)?(?: \[(?<DiscCount>\d+) Discs])?$/i;

const WorkspaceStatus: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    const [workspaceAlbums, setWorkspaceAlbums] = useState<WorkspaceAlbum[]>([]);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const [workspaceBasePath] = useAtom(WorkspaceBasePathAtom);
    const [publishingPath, setPublishingPath] = useState("");
    const unlistenRef = useRef<UnlistenFn>();
    const isInitialized = useRef(false);
    const publishLock = useRef(false);

    const refreshWorkspaceStatus = useCallback(async () => {
        if (!workspaceBasePath) {
            return;
        }
        const result = await getWorkspaceAlbums(workspaceBasePath);
        setWorkspaceAlbums(result);
    }, [workspaceBasePath]);

    useEffect(() => {
        if (isInitialized.current) {
            return;
        }
        isInitialized.current = true;
        listen("workspace_status_change", refreshWorkspaceStatus).then((unlisten) => {
            unlistenRef.current = unlisten;
        });
        return () => {
            isInitialized.current = false;
            unlistenRef.current && unlistenRef.current();
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
        if (publishLock.current) {
            return;
        }
        publishLock.current = true;
        setPublishingPath(albumPath);
        try {
            await publishAlbum(workspaceBasePath, albumPath);
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(
                    `Failed to publish album, error: ${e.message}, workspacePath: ${workspaceBasePath}, albumPath: ${albumPath}`
                );
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
        } finally {
            setPublishingPath("");
            publishLock.current = false;
        }
    };

    useEffect(() => {
        refreshWorkspaceStatus();
    }, [workspaceBasePath, refreshWorkspaceStatus]);

    return (
        <div className={styles.workspaceStatusContainer}>
            <div className={styles.fileList}>
                {workspaceAlbums
                    .filter((album) => album.type === WorkspaceState.COMMITTED)
                    .map((album, index) => {
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
