import React, { useState } from "react";
import { useAtomValue } from "jotai";
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, HTMLSelect, InputGroup, Intent } from "@blueprintjs/core";
import { AppToaster } from "@/utils/toaster";
import { appendTagFile } from "@/utils/tag";
import { TAG_TYPE_DETAIL } from "@/constants";
import { ParsedTag } from "@/types/tag";
import { stringifyTags } from "@/utils/helper";
import { WorkspaceRepoTagBasePathAtom } from "../state";
import CommonTagEditor from "./index";

interface Props {
    newTagName: string;
    isOpen: boolean;
    onClose: () => void;
    onCreated: (tagName: string, tagType: string) => void;
}

const CreateTagDialog: React.FC<Props> = (props) => {
    const { newTagName, isOpen, onClose, onCreated } = props;
    const tagBasePath = useAtomValue(WorkspaceRepoTagBasePathAtom);
    const [tagName, setTagName] = useState(newTagName);
    const [type, setType] = useState("artist");
    const [includedByTags, setIncludedByTags] = useState<ParsedTag[]>([]);
    const [loading, setLoading] = useState(false);

    const onConfirm = async () => {
        setLoading(true);
        try {
            const tagFilePath = await window.__native_bridge.path.resolve(tagBasePath, "./auto_generated.toml");
            await appendTagFile(tagFilePath, { name: tagName, type: type, includedBy: stringifyTags(includedByTags) });
            onCreated(tagName, type);
        } catch (e) {
            if (e instanceof Error) {
                AppToaster.show({ message: e.message, intent: Intent.DANGER });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog isOpen={isOpen} title="创建标签" onClose={onClose}>
            <DialogBody>
                <FormGroup label="标签名" labelInfo="(required)">
                    <InputGroup
                        value={tagName}
                        onChange={(e) => {
                            setTagName(e.target.value);
                        }}
                    ></InputGroup>
                </FormGroup>
                <FormGroup label="类型" labelInfo="(required)">
                    <HTMLSelect
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value);
                        }}
                    >
                        {TAG_TYPE_DETAIL.map((option) => (
                            <option value={option.value} key={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </HTMLSelect>
                </FormGroup>
                <FormGroup label="所属标签">
                    <CommonTagEditor
                        allowCreate={false}
                        initialTags={includedByTags}
                        onChange={(tags) => {
                            setIncludedByTags(tags);
                        }}
                    />
                </FormGroup>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button loading={loading} intent={Intent.PRIMARY} onClick={onConfirm}>
                            创建
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default CreateTagDialog;
