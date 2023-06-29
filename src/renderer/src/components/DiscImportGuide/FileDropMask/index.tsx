import React, { useCallback, useEffect, useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import { useFileDrop } from "@/hooks/useFileDrop";
import { useSettings } from "@/state/settings";
import EventBus from "@/utils/event_bus";
import Logger from "@/utils/log";
import {
    ALBUM_COMMITTED_EVENT,
    ALBUM_DIRECTORY_DROP_EVENT,
    ALBUM_IMPORT_ERROR_EVENT,
    ALBUM_IMPORT_INTERRUPT_EVENT,
} from "../constants";

let queue: string[] = [];

const FileDropMask: React.FC = () => {
    const [isShowNextDialog, setIsShowNextDialog] = useState(false);
    const [skipContinuousImportConfirm] = useSettings("workspace.skipContinuousImportConfirm", "0");

    const onFileDrop = useCallback((filePaths: string[]) => {
        Logger.debug(`File drop, paths: ${filePaths.join(",")}`);
        queue = filePaths.slice(1);
        EventBus.send(ALBUM_DIRECTORY_DROP_EVENT, { filePath: filePaths[0] });
    }, []);

    const onNextDialogConfirm = useCallback(() => {
        const nextPath = queue.shift();
        setIsShowNextDialog(false);
        Logger.debug(`Continue import, next path: ${nextPath}`);
        EventBus.send(ALBUM_DIRECTORY_DROP_EVENT, { filePath: nextPath });
    }, []);

    const onNextDialogCancel = useCallback(() => {
        setIsShowNextDialog(false);
        queue = [];
    }, []);

    const onAlbumImportFinish = useCallback(() => {
        if (queue.length) {
            if (skipContinuousImportConfirm) {
                Logger.debug("Skip next dialog due to user settings");
                onNextDialogConfirm();
            } else {
                setIsShowNextDialog(true);
            }
        }
    }, [onNextDialogConfirm, skipContinuousImportConfirm]);

    useEffect(() => {
        const unlistens = [
            EventBus.addEventListener(ALBUM_IMPORT_INTERRUPT_EVENT, onAlbumImportFinish),
            EventBus.addEventListener(ALBUM_COMMITTED_EVENT, onAlbumImportFinish),
        ];
        return () => {
            unlistens.forEach((f) => {
                f();
            });
        };
    }, [onAlbumImportFinish]);

    useEffect(() => {
        const unlisten = EventBus.addEventListener(ALBUM_IMPORT_ERROR_EVENT, () => {
            queue = [];
        });
        return () => {
            unlisten();
        };
    }, []);

    useFileDrop({ onDrop: onFileDrop });

    return (
        <Dialog isOpen={isShowNextDialog} title="继续导入">
            <DialogBody>继续导入下一专辑？队列中还有{queue.length}条</DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onNextDialogCancel}>今天就到这了</Button>
                        <Button intent={Intent.PRIMARY} onClick={onNextDialogConfirm}>
                            继续导入
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default FileDropMask;
