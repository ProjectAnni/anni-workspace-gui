import React, { useState } from "react";
import { Button, ButtonGroup } from "@blueprintjs/core";
import styles from "./index.module.scss";
import ViewCodeDialog from "./ViewCodeDialog";

const AlbumEditorActions: React.FC = () => {
    const [isShowViewCodeDialog, setIsShowViewCodeDialog] = useState(false);
    return (
        <div className={styles.albumEditorActionsContainer}>
            <ButtonGroup>
                <Button icon="search" small outlined minimal>
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
        </div>
    );
};

export default AlbumEditorActions;
