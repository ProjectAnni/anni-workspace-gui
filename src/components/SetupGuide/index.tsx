import { Button, Text } from "@fluentui/react-components";
import { open } from "@tauri-apps/api/dialog";
import React from "react";
import "./index.scss";

const SetupGuide: React.FC = () => {
    const onMainButtonClick = async () => {
        const selected = await open({
            directory: true,
            multiple: false,
        });
        console.log(selected);
    };
    return (
        <div className="setup-guide-container">
            <div className="button-container" onClick={onMainButtonClick}>
                <Button>选择工作目录</Button>
            </div>
            <Text className="help-text">请选择 Anni 的工作目录</Text>
        </div>
    );
};

export default SetupGuide;
