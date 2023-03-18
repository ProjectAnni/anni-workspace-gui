import React from "react";
import { useAtom } from "jotai";
import CommonDateEditor from "@/components/Workspace/CommonDateEditor";
import { AlbumDataReducerAtom } from "../state";

interface Props {
    onChange: (value: string) => void;
}

const EditReleaseDate: React.FC<Props> = (props: Props) => {
    const { onChange } = props;
    const [albumData] = useAtom(AlbumDataReducerAtom);
    const { date } = albumData || {};

    const onTextValueChange = (newDate: string) => {
        onChange(newDate);
    };

    return <CommonDateEditor key={date} initialValue={date} onChange={onTextValueChange} />;
};

export default EditReleaseDate;
