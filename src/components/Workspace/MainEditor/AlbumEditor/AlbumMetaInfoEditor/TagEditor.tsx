import React from "react";
import { useAtom } from "jotai";
import { FormGroup } from "@blueprintjs/core";
import CommonTagEditor from "@/components/Workspace/CommonTagEditor";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";

const LocalTagEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { tags } = albumData || {};
    const onChange = (tags: string[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TAGS,
            payload: tags,
        });
    };

    return (
        <FormGroup label="专辑标签">
            <CommonTagEditor key={JSON.stringify(tags)} initialTags={tags || []} onChange={onChange} />
        </FormGroup>
    );
};

export default LocalTagEditor;
