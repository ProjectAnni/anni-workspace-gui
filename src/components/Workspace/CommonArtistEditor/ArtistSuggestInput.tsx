import React from "react";
import ReactDOM from "react-dom";
import { uniqBy } from "lodash";
import { Suggest2 } from "@blueprintjs/select";
import { Card, MenuItem } from "@blueprintjs/core";
import AlbumFileIndexer, { IndexedArtist } from "@/indexer/AlbumFileIndexer";
import styles from "./index.module.scss";
import { parseArtists } from "@/utils/helper";

interface Props {
    style: React.CSSProperties;
    onClose: () => void;
    onItemSelected: (indexedArtist: IndexedArtist) => void;
}

const ArtistSuggestInput: React.FC<Props> = (props) => {
    const { style, onClose, onItemSelected } = props;
    const onCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
    const onCreateNewItemFromQuery = (query: string): IndexedArtist => {
        if (!query) {
            return;
        }
        try {
            const newArtist = parseArtists(query)[0];
            return {
                name: newArtist.name,
                serializedFullStr: query,
                id: `new-${crypto.randomUUID()}`,
            };
        } catch (e) {
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
                inputValueRenderer={(artist) => artist.serializedFullStr}
                itemRenderer={(artist, itemRendererProps) => (
                    <MenuItem
                        text={artist.serializedFullStr}
                        style={{
                            maxWidth: "400px",
                        }}
                        key={artist.id}
                        active={itemRendererProps.modifiers.active}
                        onClick={(item) => {
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
                        }))
                        .slice(0, 10);
                }}
                createNewItemFromQuery={onCreateNewItemFromQuery}
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
