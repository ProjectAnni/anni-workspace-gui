import React, { useMemo, useState } from "react";
import { open } from "@tauri-apps/api/dialog";
import {
    MultistepDialog,
    DialogStep,
    FormGroup,
    InputGroup,
    FileInput,
    Classes,
} from "@blueprintjs/core";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const CreateWorkspaceDialog: React.FC<Props> = (props: Props) => {
    const { isOpen, onClose } = props;
    const [remoteRepositoryUrl, setRemoteRepositoryUrl] = useState("");
    const [publishPath, setPublishPath] = useState("");
    const [layer, setLayer] = useState(2);
    const isRemoteRepositoryUrlValid = useMemo(() => {
        try {
            new URL(remoteRepositoryUrl);
            return true;
        } catch {
            return false;
        }
    }, [remoteRepositoryUrl]);
    const onSelectPublishPath = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
        });
        setPublishPath(selected as string);
    };
    return (
        <MultistepDialog title="创建工作目录" isOpen={isOpen} onClose={onClose}>
            <DialogStep
                title="仓库信息"
                id="repo-info"
                nextButtonProps={{
                    disabled: !isRemoteRepositoryUrlValid,
                }}
                panel={
                    <>
                        <div className={Classes.DIALOG_BODY}>
                            <FormGroup label="远端仓库地址">
                                <InputGroup
                                    value={remoteRepositoryUrl}
                                    onChange={(e) => {
                                        setRemoteRepositoryUrl(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </div>
                    </>
                }
            />
            <DialogStep
                title="工作空间配置"
                id="workspace-config"
                panel={
                    <>
                        <div className={Classes.DIALOG_BODY}>
                            <FormGroup label="远端仓库地址">
                                <FileInput
                                    inputProps={{
                                        onClick: (e) => {
                                            e.preventDefault();
                                            onSelectPublishPath();
                                        },
                                    }}
                                    hasSelection={!!publishPath}
                                    text={publishPath || "选择目录..."}
                                    fill
                                />
                            </FormGroup>
                            <FormGroup label="嵌套深度">
                                <InputGroup
                                    type="number"
                                    min={0}
                                    max={4}
                                    value={layer.toString()}
                                    onChange={(e) => {
                                        setLayer(+e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </div>
                    </>
                }
            />
        </MultistepDialog>
    );
};

export default CreateWorkspaceDialog;
