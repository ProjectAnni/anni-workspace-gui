import React from "react";
import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import { useAtom } from "jotai";
import { AlbumDataReducerAtom } from "../../state";
import { AppToaster } from "@/utils/toaster";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ViewCodeDialog: React.FC<Props> = (props) => {
    const { isOpen, onClose } = props;
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(albumData, null, 2));
            AppToaster.show({ message: "复制成功", intent: Intent.SUCCESS });
        } catch (e) {
            AppToaster.show({ message: "复制失败", intent: Intent.DANGER });
        }
    };
    if (!albumData) {
        return null;
    }
    return (
        <Dialog isOpen={isOpen} title="查看JSON" style={{ width: "70vw" }} onClose={onClose}>
            <DialogBody>
                <pre>{JSON.stringify(albumData, null, 2)}</pre>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onCopy}>复制</Button>
                        <Button intent={Intent.PRIMARY} onClick={onClose}>
                            确认
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default ViewCodeDialog;
