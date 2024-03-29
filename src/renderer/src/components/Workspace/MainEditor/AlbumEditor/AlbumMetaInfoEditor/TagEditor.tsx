import React from "react";
import { useAtom } from "jotai";
import { FormGroup } from "@blueprintjs/core";
import CommonTagEditor from "@/components/Workspace/CommonTagEditor";
import { ParsedTag } from "@/types/tag";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";

const LocalTagEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { tags } = albumData || {};
    const onChange = (tags: ParsedTag[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TAGS,
            payload: tags,
        });
    };

    return (
        <FormGroup label="专辑标签">
            <CommonTagEditor initialTags={tags || []} onChange={onChange} />
        </FormGroup>
    );
};

export default LocalTagEditor;
