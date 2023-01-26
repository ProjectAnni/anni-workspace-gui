import { HTMLSelect } from "@blueprintjs/core";
import React, { useState } from "react";

const OPTIONS = [
    {
        value: "normal",
        label: "normal",
    },
    {
        value: "instrumental",
        label: "instrumental",
    },
    {
        value: "absolute",
        label: "absolute",
    },
    {
        value: "drama",
        label: "drama",
    },
    {
        value: "radio",
        label: "radio",
    },
    {
        value: "vocal",
        label: "vocal",
    },
];

interface Props {
    initialValue: string;
    onChange: (value: string) => void;
}

const CommonTypeEditor: React.FC<Props> = (props) => {
    const { initialValue, onChange } = props;
    const [value, setValue] = useState(initialValue);

    const onValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value);
        onChange(e.target.value);
    };

    return (
        <HTMLSelect value={value} onChange={onValueChange}>
            {OPTIONS.map((option) => (
                <option value={option.value} key={option.value}>
                    {option.label}
                </option>
            ))}
        </HTMLSelect>
    );
};

export default CommonTypeEditor;
