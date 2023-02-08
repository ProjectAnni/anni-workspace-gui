import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Dialog, DialogBody, DialogFooter, FormGroup, Intent, Spinner } from "@blueprintjs/core";
import { readAlbumCover } from "@/utils/album";
import { fs, path } from "@tauri-apps/api";
import { open } from "@tauri-apps/api/dialog";
import styles from "./index.module.scss";
import CoverSearchDialog from "../CoverSearchDialog";

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

    useEffect(() => {
        (async () => {
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
        })();
        return () => {};
    }, [workingDirectoryPath]);

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
        const prevCoverUrl = coverUrl;
        const coverExt = await path.extname(selected);
        const coverFilename = await path.basename(selected);
        const coverData = await fs.readBinaryFile(selected);
        const mimeType = coverExt === "png" ? "image/png" : "image/jpeg";
        const blob = new Blob([coverData.buffer], { type: mimeType });
        const url = URL.createObjectURL(blob);
        setCoverUrl(url);
        setCurrentCoverFilename(coverFilename);
        setCurrentCoverFilePath(selected);
        setTimeout(() => {
            prevCoverUrl && URL.revokeObjectURL(prevCoverUrl);
        }, 1 / 60);
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
                            <Button onClick={onSelectFile}>选择文件</Button>
                            <Button
                                onClick={() => {
                                    setIsShowCoverSearchDialog(true);
                                }}
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
            />
        </>
    );
};

export default CoverConfirmDialog;
