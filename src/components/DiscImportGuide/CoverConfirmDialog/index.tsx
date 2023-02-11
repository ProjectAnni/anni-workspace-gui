import React, { useCallback, useEffect, useState } from "react";
import { Button, ButtonGroup, Dialog, DialogBody, DialogFooter, FormGroup, Intent, Spinner } from "@blueprintjs/core";
import { readAlbumCover, writeAlbumCover } from "@/utils/album";
import { fs, path } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import CoverSearchDialog from "../CoverSearchDialog";
import { downloadCover } from "../services";
import styles from "./index.module.scss";
import { AppToaster } from "@/utils/toaster";

interface Props {
    isOpen: boolean;
    workingDirectoryPath: string;
    albumName: string;
    onClose: () => void;
}

const CoverConfirmDialog: React.FC<Props> = (props) => {
    const { isOpen, workingDirectoryPath, albumName, onClose } = props;
    const [coverUrl, setCoverUrl] = useState("");
    const [currentCoverFilePath, setCurrentCoverFilePath] = useState("");
    const [currentCoverFilename, setCurrentCoverFilename] = useState("");
    const [isCoverLoading, setIsCoverLoading] = useState(false);
    const [isShowCoverSearchDialog, setIsShowCoverSearchDialog] = useState(false);

    const readAlbumCoverFromDirectory = useCallback(async () => {
        try {
            const result = await readAlbumCover(workingDirectoryPath);
            if (result) {
                const [coverData, coverPath] = result;
                const coverExt = await path.extname(coverPath);
                const coverFilename = await path.basename(coverPath);
                const mimeType = coverExt === "png" ? "image/png" : "image/jpeg";
                const blob = new Blob([coverData.buffer], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setCoverUrl(url);
                setCurrentCoverFilename(coverFilename);
                setCurrentCoverFilePath(coverPath);
            }
        } catch (e) {
            AppToaster.show({ message: "读取封面失败", intent: Intent.DANGER });
        }
    }, [workingDirectoryPath]);

    useEffect(() => {
        readAlbumCoverFromDirectory();
        return () => {};
    }, [workingDirectoryPath]);

    const onCoverSelected = useCallback(
        async (url: string, mimeType = "image/jpeg") => {
            setIsShowCoverSearchDialog(false);
            setIsCoverLoading(true);
            try {
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
        [workingDirectoryPath]
    );

    const onSelectFile = async () => {
        const selected = (await open({
            directory: false,
            multiple: false,
            filters: [
                {
                    name: "专辑封面",
                    extensions: ["png", "jpg", "jpeg"],
                },
            ],
        })) as string;
        if (!selected) {
            return;
        }
        setIsCoverLoading(true);
        try {
            const coverData = await fs.readBinaryFile(selected);
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
                    <FormGroup label={`当前封面${currentCoverFilename ? ` - ${currentCoverFilename}` : ""}`}>
                        <div className={styles.currentCover}>
                            {!!coverUrl && <img src={coverUrl}></img>}
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
                        <Button intent={Intent.PRIMARY} disabled={!coverUrl}>
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
