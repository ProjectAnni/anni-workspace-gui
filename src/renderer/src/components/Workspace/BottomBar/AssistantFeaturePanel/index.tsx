import React from "react";
import { FormGroup, HTMLSelect, InputGroup } from "@blueprintjs/core";
import SectionTitle from "@/components/Common/SectionTitle";
import styles from "./index.module.scss";
import { useSettings } from "@/state/settings";

const AssistantFeaturePanel: React.FC = () => {
    const [openAiModel, setOpenAiModel] = useSettings("assistant.openai.model", "gpt-3.5-turbo");
    const [openAiApiEndpoint, setOpenAiApiEndpoint] = useSettings(
        "assistant.openai.apiEndpoint",
        "https://api.openai.com"
    );
    const [openAiApiKey, setOpenAiApiKey] = useSettings("assistant.openai.apiKey", "");
    return (
        <div className={styles.panel}>
            <SectionTitle text="OpenAI" />
            <FormGroup label="使用模型">
                <HTMLSelect
                    value={openAiModel}
                    onChange={(e) => {
                        setOpenAiModel(e.target.value);
                    }}
                >
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                </HTMLSelect>
            </FormGroup>
            <FormGroup label="API Endpoint">
                <InputGroup
                    value={openAiApiEndpoint}
                    onChange={(e) => {
                        setOpenAiApiEndpoint(
                            e.target.value.endsWith("/") ? e.target.value.slice(0, -1) : e.target.value
                        );
                    }}
                ></InputGroup>
            </FormGroup>
            <FormGroup label="API Key">
                <InputGroup
                    value={openAiApiKey}
                    onChange={(e) => {
                        setOpenAiApiKey(e.target.value);
                    }}
                ></InputGroup>
            </FormGroup>
        </div>
    );
};

export default AssistantFeaturePanel;
