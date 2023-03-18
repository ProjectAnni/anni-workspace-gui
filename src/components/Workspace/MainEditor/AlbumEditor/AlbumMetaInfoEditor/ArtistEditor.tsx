import React from "react";
import { useAtom } from "jotai";
import { FormGroup } from "@blueprintjs/core";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { Artist } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";

const LocalArtistEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { artist } = albumData || {};
    const onArtistChange = (artists: Artist[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_ARTIST,
            payload: artists,
        });
    };
    if (!artist) {
        // TODO
        return null;
    }
    return (
        <FormGroup label="艺术家" labelInfo="(required)">
            <CommonArtistEditor initialArtists={artist} onChange={onArtistChange} />
        </FormGroup>
    );
};

export default LocalArtistEditor;
