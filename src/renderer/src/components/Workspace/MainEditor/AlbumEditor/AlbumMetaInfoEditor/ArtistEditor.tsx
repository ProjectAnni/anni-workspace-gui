import React from "react";
import { useAtom } from "jotai";
import { FormGroup } from "@blueprintjs/core";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { Artist } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import LocalAlbumFileIndexer from "../indexer";

const LocalArtistEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { artist } = albumData || {};
    const onArtistSearch = (keyword: string) => {
        return LocalAlbumFileIndexer.searchArtist(keyword);
    };
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
            <CommonArtistEditor initialArtists={artist} onSearch={onArtistSearch} onChange={onArtistChange} />
        </FormGroup>
    );
};

export default LocalArtistEditor;
