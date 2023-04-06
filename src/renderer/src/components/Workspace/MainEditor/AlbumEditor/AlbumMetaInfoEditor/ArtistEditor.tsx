import React from "react";
import { useAtom } from "jotai";
import { uniqBy } from "lodash";
import { FormGroup } from "@blueprintjs/core";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { Artist } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../state";
import AlbumFileIndexer from "@/indexer/AlbumFileIndexer";

const LocalArtistEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { artist } = albumData || {};
    const onArtistSearch = (keyword: string) => {
        const searchResults = AlbumFileIndexer.searchArtist(keyword);
        return uniqBy(searchResults, "serializedFullStr")
            .map((result) => ({
                id: result.id,
                name: result.name,
                serializedFullStr: result.serializedFullStr,
                albumTitle: result.albumTitle,
            }))
            .slice(0, 10);
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
