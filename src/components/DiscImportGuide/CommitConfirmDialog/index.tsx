import React, { useMemo } from "react";
import { WorkspaceDisc } from "@/components/Workspace/types";
import { Button, Dialog, DialogBody, DialogFooter, Intent, Tree, TreeNodeInfo } from "@blueprintjs/core";

const shortenPath = (path: string, level = -2) => {
    return path
        .split(/[\\\/]/)
        .slice(level)
        .join("/");
};

interface Props {
    isOpen: boolean;
    discs: WorkspaceDisc[];
    onClose: () => void;
    onConfirm: () => void;
}

const CommitConfirmDialog: React.FC<Props> = (props) => {
    const { isOpen, discs, onClose, onConfirm } = props;
    const parsedDiscs = useMemo<TreeNodeInfo[]>(() => {
        const result: TreeNodeInfo[] = [];
        if (!discs?.length) {
            return result;
        }
        return discs.map((disc, index) => {
            return {
                id: index,
                label: shortenPath(disc.path),
                isExpanded: true,
                childNodes: disc.tracks.map((track, trackIndex) => ({
                    id: `${index}-${trackIndex}`,
                    label: shortenPath(track, -1),
                })),
            };
        });
    }, [discs]);
    return (
        <Dialog
            isOpen={isOpen}
            title="确认导入内容"
            onClose={onClose}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
        >
            <DialogBody>
                <Tree contents={parsedDiscs}></Tree>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button intent={Intent.PRIMARY} onClick={onConfirm}>
                            确认导入
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default CommitConfirmDialog;
