import React from "react";
import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";

interface Props {
    isOpen: boolean;
    workingDirectoryPath: string;
    onClose: () => void;
    onCancel: () => void;
    onConfirm: () => void;
}

const InterruptConfirmDialog: React.FC<Props> = (props) => {
    const { isOpen, workingDirectoryPath, onClose, onCancel, onConfirm } = props;
    return (
        <Dialog title="中断流程确认" isOpen={isOpen} onClose={onClose}>
            <DialogBody>是否清理中间文件</DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onCancel}>放弃导入</Button>
                        <Button intent={Intent.PRIMARY} onClick={onConfirm}>
                            清理并放弃导入
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default InterruptConfirmDialog;
