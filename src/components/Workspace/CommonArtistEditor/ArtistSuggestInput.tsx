import React, { useState } from "react";
import ReactDOM from "react-dom";
import { uniqBy } from "lodash";
import { Suggest2 } from "@blueprintjs/select";
import { Card, MenuItem } from "@blueprintjs/core";
import { parseArtists } from "@/utils/helper";
import AlbumFileIndexer, { IndexedArtist } from "@/indexer/AlbumFileIndexer";
import ArtistSuggestItem from "./ArtistSuggestItem";
import styles from "./index.module.scss";

interface Props {
    style: React.CSSProperties;
    onClose: () => void;
    onItemSelected: (indexedArtist: IndexedArtist) => void;
}

const ArtistSuggestInput: React.FC<Props> = (props) => {
    const { style, onClose, onItemSelected } = props;
    const [query, setQuery] = useState("");
    const onCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
    const onCreateNewItemFromQuery = (query: string): IndexedArtist => {
        if (!query) {
            // @ts-ignore
            return;
        }
        try {
            const newArtist = parseArtists(query)[0];
            return {
                name: newArtist.name,
                serializedFullStr: query,
                id: `new-${crypto.randomUUID()}`,
                albumTitle: "",
            };
        } catch (e) {
            // @ts-ignore
            return;
        }
    };
    return ReactDOM.createPortal(
        <Card
            style={style}
            className={styles.artistSuggestInputCard}
            onClick={onCardClick}
        >
            <Suggest2<IndexedArtist>
                items={[]}
                query={query}
                inputValueRenderer={(artist) => artist.serializedFullStr}
                itemRenderer={(artist, itemRendererProps) => (
                    <ArtistSuggestItem
                        styles={{
                            maxWidth: "400px",
                        }}
                        query={query}
                        artist={artist}
                        key={artist.id}
                        itemRendererProps={itemRendererProps}
                        onClick={() => {
                            onItemSelected(artist);
                        }}
                    />
                )}
                itemListPredicate={(keyword) => {
                    const searchResults =
                        AlbumFileIndexer.searchArtist(keyword);
                    return uniqBy(searchResults, "serializedFullStr")
                        .map((result) => ({
                            id: result.id,
                            name: result.name,
                            serializedFullStr: result.serializedFullStr,
                            albumTitle: result.albumTitle,
                        }))
                        .slice(0, 10);
                }}
                createNewItemFromQuery={onCreateNewItemFromQuery}
                createNewItemRenderer={(query, active) => {
                    return (
                        <MenuItem
                            text={`创建：${query}`}
                            active={active}
                            onClick={() => {
                                onItemSelected(onCreateNewItemFromQuery(query));
                            }}
                            style={{ fontSize: "0.12rem" }}
                        />
                    );
                }}
                onQueryChange={(q) => {
                    setQuery(q);
                }}
                onItemSelect={(item) => {
                    onItemSelected(item);
                }}
                inputProps={{
                    autoFocus: true,
                    onBlur: (e) => {
                        if (e.relatedTarget?.role !== "menuitem") {
                            onClose();
                        }
                    },
                }}
                popoverProps={{
                    matchTargetWidth: true,
                    minimal: true,
                }}
            />
        </Card>,
        document.body
    );
};

export default ArtistSuggestInput;
