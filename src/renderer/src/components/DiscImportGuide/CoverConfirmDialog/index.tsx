import React, { useCallback, useEffect, useState, useRef } from "react";
import { Button, ButtonGroup, Dialog, DialogBody, DialogFooter, FormGroup, Intent, Spinner } from "@blueprintjs/core";
import { AppToaster } from "@/utils/toaster";
import Logger from "@/utils/log";
import CoverSearchDialog from "../CoverSearchDialog";
import { cleanupAlbumDirectory, downloadCover, readAlbumCover, writeAlbumCover } from "../services";
import styles from "./index.module.scss";

interface Props {
    isOpen: boolean;
    workingDirectoryPath: string;
    albumName: string;
    onClose: () => void;
    onConfirm: () => void;
}

const CoverConfirmDialog: React.FC<Props> = (props) => {
    const { isOpen, workingDirectoryPath, albumName, onClose, onConfirm } = props;
    const [coverUrl, setCoverUrl] = useState("");
    const [currentCoverFilePath, setCurrentCoverFilePath] = useState("");
    const [currentCoverFilename, setCurrentCoverFilename] = useState("");
    const [currentCoverData, setCurrentCoverData] = useState<Uint8Array>();
    const [coverNaturalWidth, setCoverNaturalWidth] = useState(0);
    const [coverNaturalHeight, setCoverNaturalHeight] = useState(0);
    const [isCoverLoading, setIsCoverLoading] = useState(false);
    const [isShowCoverSearchDialog, setIsShowCoverSearchDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const coverRef = useRef<HTMLImageElement>(null);

    const readAlbumCoverFromDirectory = useCallback(async () => {
        if (!workingDirectoryPath) {
            return;
        }
        try {
            Logger.debug(`Read cover from: ${workingDirectoryPath}`);
            const result = await readAlbumCover(workingDirectoryPath);
            if (result) {
                const [coverData, coverPath] = result;
                const coverExt = await window.__native_bridge.path.extname(coverPath);
                const coverFilename = await window.__native_bridge.path.basename(coverPath);
                const mimeType = coverExt.toLocaleLowerCase() === ".png" ? "image/png" : "image/jpeg";
                const blob = new Blob([coverData.buffer], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setCoverUrl(url);
                setCurrentCoverFilename(coverFilename);
                setCurrentCoverFilePath(coverPath);
                setCurrentCoverData(coverData);
            }
        } catch (e) {
            AppToaster.show({ message: "读取封面失败", intent: Intent.DANGER });
        }
    }, [workingDirectoryPath]);

    useEffect(() => {
        readAlbumCoverFromDirectory();
    }, [readAlbumCoverFromDirectory, workingDirectoryPath]);

    const onCoverSelected = useCallback(
        async (url: string, mimeType = "image/jpeg") => {
            setIsShowCoverSearchDialog(false);
            setIsCoverLoading(true);
            try {
                Logger.debug(`Download cover from: ${url}`);
                const coverData = await downloadCover(url);
                if (coverData) {
                    await writeAlbumCover(workingDirectoryPath, coverData);
                    await readAlbumCoverFromDirectory();
                }
            } catch (e) {
                AppToaster.show({ message: "下载封面失败", intent: Intent.DANGER });
            } finally {
                setIsCoverLoading(false);
            }
        },
        [readAlbumCoverFromDirectory, workingDirectoryPath]
    );

    const onSelectFile = async () => {
        const selected = await window.__native_bridge.dialog.open({
            filters: [
                {
                    name: "专辑封面",
                    extensions: ["png", "jpg", "jpeg"],
                },
            ],
            properties: ["openFile"],
        });
        if (!selected) {
            return;
        }
        setIsCoverLoading(true);
        try {
            const coverData = await window.__native_bridge.fs.readBinaryFile(selected[0]);
            if (coverData) {
                await writeAlbumCover(workingDirectoryPath, coverData);
                await readAlbumCoverFromDirectory();
            }
        } catch (e) {
            AppToaster.show({ message: "读取封面失败", intent: Intent.DANGER });
        } finally {
            setIsCoverLoading(false);
        }
        setIsCoverLoading(false);
    };

    const onConfirmClick = async () => {
        if (!currentCoverData) {
            AppToaster.show({ message: "请选择封面图片", intent: Intent.DANGER });
            return;
        }

        const coverExt = await window.__native_bridge.path.extname(currentCoverFilePath);
        // 如当前有效封面为 PNG 格式则利用 Canvas 进行格式转换
        if (coverExt.toLowerCase() === ".png") {
            if (!coverRef.current || !coverNaturalHeight || !coverNaturalWidth) {
                AppToaster.show({ message: "图片未加载完成", intent: Intent.DANGER });
                return;
            }
            try {
                setIsLoading(true);
                // Convert PNG to JPEG
                const canvas = document.createElement("canvas");
                canvas.width = coverNaturalWidth;
                canvas.height = coverNaturalHeight;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(coverRef.current, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg", 1.0);
                const binaryData = window.atob(dataURL.split(",")[1]);
                const coverData: Uint8Array = new Uint8Array(binaryData.length);
                for (let i = 0; i < binaryData.length; i++) {
                    coverData[i] = binaryData.charCodeAt(i);
                }
                setCurrentCoverData(coverData);
                AppToaster.show({ message: "已将封面格式转换为JPEG" });
            } catch (e) {
                if (e instanceof Error) {
                    Logger.error(
                        `Failed to convert cover from png to jpeg, coverPath: ${currentCoverFilePath}, error: ${e.message}`
                    );
                    AppToaster.show({ message: "图片格式转换失败", intent: Intent.DANGER });
                }
            } finally {
                setIsLoading(false);
            }
        }

        // 保存当前封面到 cover.jpg 并清理多余文件 多余文件无法通过 anni 检查
        try {
            await writeAlbumCover(workingDirectoryPath, currentCoverData);
            await cleanupAlbumDirectory(workingDirectoryPath);
            onConfirm();
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(`Failed to save cover file, coverPath: ${currentCoverFilePath}, error: ${e.message}`);
                AppToaster.show({ message: "保存封面文件失败", intent: Intent.DANGER });
            }
        }
    };

    const onImageLoaded = () => {
        if (!coverRef.current) {
            return;
        }
        setCoverNaturalWidth(coverRef.current.naturalWidth);
        setCoverNaturalHeight(coverRef.current.naturalHeight);
    };

    return (
        <>
            <Dialog
                title="确认封面"
                isOpen={isOpen}
                onClose={onClose}
                canEscapeKeyClose={false}
                canOutsideClickClose={false}
            >
                <DialogBody>
                    <FormGroup
                        label={`当前封面${currentCoverFilename ? ` - ${currentCoverFilename}` : ""}${
                            !!coverNaturalHeight && !!coverNaturalWidth
                                ? ` - ${coverNaturalWidth}x${coverNaturalHeight}`
                                : ""
                        }`}
                    >
                        <div className={styles.currentCover}>
                            {!!coverUrl && <img src={coverUrl} ref={coverRef} onLoad={onImageLoaded}></img>}
                            {isCoverLoading && (
                                <div className={styles.coverLoading}>
                                    <Spinner size={24} />
                                </div>
                            )}
                        </div>
                    </FormGroup>
                    <FormGroup label="修改封面">
                        <ButtonGroup>
                            <Button onClick={onSelectFile} disabled={isCoverLoading}>
                                选择文件
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsShowCoverSearchDialog(true);
                                }}
                                disabled={isCoverLoading}
                            >
                                搜索封面
                            </Button>
                        </ButtonGroup>
                    </FormGroup>
                </DialogBody>
                <DialogFooter
                    actions={
                        <Button
                            intent={Intent.PRIMARY}
                            disabled={!coverUrl}
                            onClick={onConfirmClick}
                            loading={isLoading}
                        >
                            确认封面
                        </Button>
                    }
                ></DialogFooter>
            </Dialog>
            <CoverSearchDialog
                key={albumName}
                keyword={albumName}
                isOpen={isShowCoverSearchDialog}
                onClose={() => {
                    setIsShowCoverSearchDialog(false);
                }}
                onCoverSelected={onCoverSelected}
            />
        </>
    );
};

export default CoverConfirmDialog;
