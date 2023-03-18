import React from "react";
import { useAtom } from "jotai";
import { FormGroup } from "@blueprintjs/core";
import CommonTypeEditor from "@/components/Workspace/CommonTypeEditor";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";

const TypeEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { type } = albumData || {};
    const onTypeChange = (type: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TYPE,
            payload: type,
        });
    };
    if (!type) {
        return null;
    }
    return (
        <FormGroup label="类型" labelInfo="(required)">
            <CommonTypeEditor key={type} initialValue={type} onChange={onTypeChange} />
        </FormGroup>
    );
};

export default TypeEditor;
