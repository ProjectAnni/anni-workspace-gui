import { FormGroup, HTMLSelect } from "@blueprintjs/core";
import { useSettings } from "@/state/settings";
import React from "react";

const LOG_LEVEL_OPTIONS = [
    {
        value: "debug",
        label: "debug",
    },
    {
        value: "info",
        label: "info",
    },
    {
        value: "warning",
        label: "warning",
    },
    {
        value: "error",
        label: "error",
    },
];

const GeneralSettings: React.FC = () => {
    const [logLevel, setLogLevel] = useSettings("general.logLevel", "debug");

    const onValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLogLevel(e.target.value);
    };

    return (
        <FormGroup label="日志等级(目前无实际作用)">
            <HTMLSelect value={logLevel} onChange={onValueChange}>
                {LOG_LEVEL_OPTIONS.map((option) => (
                    <option value={option.value} key={option.value}>
                        {option.label}
                    </option>
                ))}
            </HTMLSelect>
        </FormGroup>
    );
};

export default GeneralSettings;
