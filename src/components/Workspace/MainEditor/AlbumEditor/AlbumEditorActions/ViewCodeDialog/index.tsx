import React, { useRef } from "react";
import { useAtom } from "jotai";
import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import { AppToaster } from "@/utils/toaster";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../../state";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ViewCodeDialog: React.FC<Props> = (props) => {
    const { isOpen, onClose } = props;
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const onCopy = async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(albumData, null, 2));
            AppToaster.show({ message: "复制成功", intent: Intent.SUCCESS });
        } catch (e) {
            AppToaster.show({ message: "复制失败", intent: Intent.DANGER });
        }
    };
    const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
        editorRef.current = editor;
    };
    const onApply = () => {
        if (!editorRef.current) {
            return;
        }
        dispatch({ type: AlbumDataActionTypes.RESET, payload: JSON.parse(editorRef.current.getValue()) });
        AppToaster.show({ message: "应用成功", intent: Intent.SUCCESS });
        onClose();
    };
    if (!albumData) {
        return null;
    }
    return (
        <Dialog isOpen={isOpen} title="查看JSON" style={{ width: "70vw" }} onClose={onClose}>
            <DialogBody>
                <Editor
                    height="60vh"
                    defaultLanguage="json"
                    defaultValue={JSON.stringify(albumData, null, 2)}
                    onMount={handleEditorDidMount}
                />
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onCopy}>复制</Button>
                        <Button intent={Intent.PRIMARY} onClick={onApply}>
                            确认
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default ViewCodeDialog;
