import React, { useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, Intent, TextArea } from "@blueprintjs/core";
import { useSettings } from "@/state/settings";
import { AppToaster } from "@/utils/toaster";
import { AutoParseAlbumInformationResult, autoParseAlbumInformation } from "../../services";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onParsed: (result: AutoParseAlbumInformationResult) => void;
}

const InformationAutoParsingDialog: React.FC<Props> = (props) => {
    const { isOpen, onClose, onParsed } = props;
    const [isLoading, setIsLoading] = useState(false);
    const [text, setText] = useState("");
    const [apiKey] = useSettings("assistant.openai.apiKey");
    const [apiEndpoint] = useSettings("assistant.openai.apiEndpoint");
    const [model] = useSettings("assistant.openai.model");

    const onParse = async () => {
        if (!apiKey || !apiEndpoint || !model) {
            AppToaster.show({ message: "请先在设置中设置 OpenAI 相关参数", intent: Intent.DANGER });
            return;
        }
        setIsLoading(true);
        try {
            const result = await autoParseAlbumInformation({ apiKey, apiEndpoint, model, text });
            onParsed(result);
        } catch (e) {
            if (e instanceof Error) {
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog title="自动解析" isOpen={isOpen} onClose={onClose}>
            <DialogBody>
                <FormGroup>
                    <TextArea
                        value={text}
                        fill
                        autoFocus
                        placeholder="在此粘贴包含信息的文本内容..."
                        onChange={(e) => {
                            setText(e.target.value);
                        }}
                        style={{ minHeight: "200px" }}
                    ></TextArea>
                </FormGroup>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button
                            intent={Intent.PRIMARY}
                            loading={isLoading}
                            onClick={() => {
                                onParse();
                            }}
                        >
                            确认
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default InformationAutoParsingDialog;
