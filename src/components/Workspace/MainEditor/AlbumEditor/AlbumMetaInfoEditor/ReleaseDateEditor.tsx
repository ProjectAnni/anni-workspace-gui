import React, { useState } from "react";
import { useAtom } from "jotai";
import { FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import { AlbumDataReducerAtom } from "../state";
import dayjs from "dayjs";

interface Props {
    onChange: (value: string) => void;
}

const EditReleaseDate: React.FC<Props> = (props: Props) => {
    const { onChange } = props;
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { date } = albumData || {};
    const [textValue, setTextValue] = useState(date);
    const [helpText, setHelpText] = useState("");
    const [intent, setIntent] = useState<Intent>("danger");

    const onTextValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setTextValue(newDate);
        if (/\d{6}/.test(newDate)) {
            // YYMMDD -> YYYY-MM-DD
            const [y1, y2, m1, m2, d1, d2] = newDate.split("");
            const autoParsedDate = `${
                +y1 < 8 ? "20" : "19"
            }${y1}${y2}-${m1}${m2}-${d1}${d2}`;
            setTextValue(autoParsedDate);
            setIntent("none");
            setHelpText("");
            onChange(autoParsedDate);
            return;
        }
        if (!/(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/.test(newDate)) {
            setIntent("danger");
            setHelpText("不是有效的发售日期");
            return;
        }
        const [_, year, month, date] = newDate.match(
            /(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?/
        )!;
        if (year && month && date) {
            if (newDate !== `${year}-${month}-${date}`) {
                setIntent("danger");
                setHelpText("不是有效的发售日期");
                return;
            }
        } else if (year && month) {
            if (newDate !== `${year}-${month}`) {
                setIntent("danger");
                setHelpText("不是有效的发售日期");
                return;
            }
        } else {
            if (newDate !== `${year}`) {
                setIntent("danger");
                setHelpText("不是有效的发售日期");
                return;
            }
        }
        if (!month || !date) {
            setIntent("warning");
            setHelpText("注意：不是准确的发售日期");
            onChange(newDate);
            return;
        }
        if (year && month && date) {
            const parsedDate = dayjs(`${year}-${month}-${date}`);
            if (parsedDate.day() !== 4) {
                setIntent("warning");
                setHelpText("注意：不是周三，建议二次确认");
                onChange(newDate);
                return;
            }
        }
        setIntent("none");
        setHelpText("");
        onChange(newDate);
    };

    return (
        <FormGroup
            label="发售日期"
            labelInfo="(required)"
            helperText={helpText}
            intent={intent}
        >
            <InputGroup value={textValue} onChange={onTextValueChange} />
        </FormGroup>
    );
};

export default EditReleaseDate;
