import React, { useState } from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import styles from "./index.module.scss";
import ViewCodeDialog from "./ViewCodeDialog";
import ImportInformationDialog from "./ImportInformationDialog";

const AlbumEditorActions: React.FC = () => {
    const [isShowViewCodeDialog, setIsShowViewCodeDialog] = useState(false);
    const [isShowImportInformationDialog, setIsShowImportInformationDialog] = useState(false);
    return (
        <div className={styles.albumEditorActionsContainer}>
            <ButtonGroup>
                <Button
                    icon="search"
                    small
                    outlined
                    minimal
                    onClick={() => {
                        setIsShowImportInformationDialog(true);
                    }}
                >
                    导入信息
                </Button>
                <Button
                    icon="code"
                    small
                    outlined
                    minimal
                    onClick={() => {
                        setIsShowViewCodeDialog(true);
                    }}
                >
                    查看JSON
                </Button>
            </ButtonGroup>
            <ViewCodeDialog
                isOpen={isShowViewCodeDialog}
                onClose={() => {
                    setIsShowViewCodeDialog(false);
                }}
            />
            <ImportInformationDialog
                isOpen={isShowImportInformationDialog}
                onClose={() => {
                    setIsShowImportInformationDialog(false);
                }}
            ></ImportInformationDialog>
        </div>
    );
};

export default AlbumEditorActions;
