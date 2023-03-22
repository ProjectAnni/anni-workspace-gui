import React from "react";
import { Alert } from "@blueprintjs/core";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const NonEmptyDirectoryErrorDialog: React.FC<Props> = (props: Props) => {
    const { isOpen, onClose } = props;
    return (
        <Alert isOpen={isOpen} confirmButtonText="我错了" onClose={onClose}>
            选择目录不是合法 Anni
            Workspace，也不是空文件夹。你只能重新选择一个目录了。
        </Alert>
    );
};

export default NonEmptyDirectoryErrorDialog;
