import React, { useMemo } from "react";
import { Intent, MenuItem, Tag } from "@blueprintjs/core";
import { ItemRendererProps } from "@blueprintjs/select";
import { IndexedArtist } from "@/indexer/AlbumFileIndexer";
import { highlightText, parseArtists } from "@/utils/helper";
import styles from "./index.module.scss";

interface Props {
    styles?: React.CSSProperties;
    artist: IndexedArtist;
    query: string;
    itemRendererProps: ItemRendererProps;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
}

const ArtistSuggestItem: React.FC<Props> = (props: Props) => {
    const {
        artist,
        query,
        itemRendererProps,
        styles: itemStyle,
        onClick,
    } = props;
    const { serializedFullStr, id, albumTitle } = artist;
    const parsedArtist = useMemo(() => {
        return parseArtists(serializedFullStr)[0];
    }, [serializedFullStr]);
    return (
        <MenuItem
            text={
                <>
                    <div className={styles.suggestItem}>
                        {parsedArtist.children?.length === 1 ? (
                            <>
                                <div className={styles.artistName}>
                                    {highlightText(parsedArtist.name, query)}
                                </div>
                                <Tag
                                    className={styles.cvTag}
                                    intent={Intent.PRIMARY}
                                >
                                    CV. {parsedArtist.children[0].name}
                                </Tag>
                            </>
                        ) : (
                            <div className={styles.artistName}>
                                {highlightText(serializedFullStr, query)}
                            </div>
                        )}
                    </div>
                    {itemRendererProps.modifiers.active && (
                        <div className={styles.albumTitle}>
                            From: {albumTitle}
                        </div>
                    )}
                </>
            }
            style={itemStyle || {}}
            active={itemRendererProps.modifiers.active}
            onClick={onClick}
            htmlTitle={serializedFullStr}
        />
    );
};

export default ArtistSuggestItem;
