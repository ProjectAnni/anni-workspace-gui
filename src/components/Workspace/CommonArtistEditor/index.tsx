import React, { useState, useRef, MutableRefObject } from "react";
import classNames from "classnames";
import { Artist } from "@/types/album";
import { Icon, MenuItem, TagInput } from "@blueprintjs/core";
import { AppToaster } from "@/utils/toaster";
import AlbumFileIndexer, { IndexedArtist } from "@/indexer/AlbumFileIndexer";
import ArtistSuggestInput from "./ArtistSuggestInput";
import styles from "./index.module.scss";
import { parseArtists } from "@/utils/helper";
import { MultiSelect2 } from "@blueprintjs/select";
import { uniqBy } from "lodash";

const MAX_STACK_LIMIT = 5;

interface ArtistItemProps {
    artist: Artist;
    depth: number;
    index: number;
    onChange: (index: number, newArtistData: Artist | null) => void;
}

const ArtistItem: React.FC<ArtistItemProps> = (props: ArtistItemProps) => {
    const { artist: initialArtist, depth, index, onChange } = props;
    const artistNameRef = useRef<HTMLDivElement>(null);
    const [artist, setArtist] = useState(initialArtist);
    const [isActive, setIsActive] = useState(false);
    const [indicatorLineStartX, setIndicatorLineStartX] = useState(0);
    const [indicatorLineEndX, setIndicatorLineEndX] = useState(0);
    const [isExpand, setIsExpand] = useState(false);
    const [isShowFloatInput, setIsShowFloatInput] = useState(false);
    const [floatingInputLeft, setFloatInputLeft] = useState(0);
    const [floatingInputTop, setFloatInputTop] = useState(0);
    const { name, children } = artist;

    const onChildSectionClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        setIsExpand(true);
    };

    const onMouseEnterActionIcons = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left: iconLeft, width: iconWidth } =
            e.currentTarget.getBoundingClientRect();
        const { left: nameLeft, width: nameWidth } =
            artistNameRef.current!.getBoundingClientRect();
        setIndicatorLineStartX(nameLeft + nameWidth / 2);
        setIndicatorLineEndX(iconLeft + iconWidth / 2);
        setIsActive(true);
    };

    const onMouseLeaveActionIcons = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsActive(false);
    };

    const onAddChildrenIconClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (depth + 1 >= MAX_STACK_LIMIT) {
            AppToaster.show({ message: "达到最大嵌套深度" });
            return;
        }
        const { left, top } = e.currentTarget.getBoundingClientRect();
        setFloatInputLeft(left);
        setFloatInputTop(top + 20);
        setIsShowFloatInput(true);
    };

    const onChildAdded = (newChildArtist: Artist) => {
        setIsShowFloatInput(false);
        setIsExpand(true);
        setArtist({
            ...artist,
            children: [...artist.children, newChildArtist],
        });
        onChange(index, {
            ...artist,
            children: [...artist.children, newChildArtist],
        });
    };

    const onChildChange = (
        childIndex: number,
        newArtistData: Artist | null
    ) => {
        if (!newArtistData) {
            setArtist({
                ...artist,
                children: [
                    ...artist.children.slice(0, childIndex),
                    ...artist.children.slice(childIndex + 1),
                ],
            });
            onChange(index, {
                ...artist,
                children: [
                    ...artist.children.slice(0, childIndex),
                    ...artist.children.slice(childIndex + 1),
                ],
            });
        } else {
            setArtist({
                ...artist,
                children: [
                    ...artist.children.slice(0, childIndex),
                    newArtistData,
                    ...artist.children.slice(childIndex + 1),
                ],
            });
            onChange(index, {
                ...artist,
                children: [
                    ...artist.children.slice(0, childIndex),
                    newArtistData,
                    ...artist.children.slice(childIndex + 1),
                ],
            });
        }
    };

    return (
        <div
            className={classNames(styles.artistItem, {
                [styles[`depth${depth}`]]: true,
            })}
        >
            <div
                className={classNames(styles.section, {
                    [styles.active]: isActive,
                })}
            >
                <span className={styles.artistName} ref={artistNameRef}>
                    {name}
                </span>
                {isActive && (
                    <div className={styles.activeIndicator}>
                        <div
                            className={styles.indicatorLine}
                            style={{
                                width: `${
                                    indicatorLineEndX - indicatorLineStartX
                                }px`,
                            }}
                        ></div>
                    </div>
                )}
            </div>
            <div className={styles.divider}></div>
            <div className={styles.section} onClick={onChildSectionClick}>
                {children?.length > 0 ? (
                    <>
                        {isExpand ? (
                            <>
                                {children.map((c, index) => (
                                    <ArtistItem
                                        artist={c}
                                        depth={depth + 1}
                                        key={c.name}
                                        index={index}
                                        onChange={onChildChange}
                                    />
                                ))}
                                <Icon
                                    icon="plus"
                                    htmlTitle="添加子级艺术家"
                                    size={12}
                                    className={styles.addIcon}
                                    onMouseEnter={onMouseEnterActionIcons}
                                    onMouseLeave={onMouseLeaveActionIcons}
                                    onClick={onAddChildrenIconClick}
                                />
                            </>
                        ) : (
                            <span
                                className={styles.childLength}
                                title="点击展开子艺术家"
                            >
                                +{children.length}
                            </span>
                        )}
                    </>
                ) : (
                    <Icon
                        icon="arrow-down"
                        size={12}
                        htmlTitle="创建子艺术家"
                        onMouseEnter={onMouseEnterActionIcons}
                        onMouseLeave={onMouseLeaveActionIcons}
                        onClick={onAddChildrenIconClick}
                    />
                )}
            </div>
            <div className={styles.divider}></div>
            <div className={styles.section}>
                <Icon
                    icon="cross"
                    size={12}
                    htmlTitle="删除艺术家"
                    onMouseEnter={onMouseEnterActionIcons}
                    onMouseLeave={onMouseLeaveActionIcons}
                    onClick={(e) => {
                        e.stopPropagation();
                        onChange(index, null);
                    }}
                />
            </div>
            {isShowFloatInput && (
                <ArtistSuggestInput
                    style={{
                        position: "fixed",
                        left: floatingInputLeft,
                        top: floatingInputTop,
                        width: "300px",
                    }}
                    onClose={() => {
                        setIsShowFloatInput(false);
                    }}
                    onItemSelected={(item) => {
                        onChildAdded(parseArtists(item.serializedFullStr)[0]);
                    }}
                />
            )}
        </div>
    );
};

interface Props {
    initialArtists: Artist[];
    onChange: (newArtists: Artist[]) => void;
}

const CommonArtistEditor: React.FC<Props> = (props: Props) => {
    const { initialArtists, onChange } = props;
    const [artists, setArtists] = useState(initialArtists);
    const [query, setQuery] = useState("");
    const onArtistChange = (index: number, newArtistData: Artist | null) => {
        if (!newArtistData) {
            setArtists([
                ...artists.slice(0, index),
                ...artists.slice(index + 1),
            ]);
            onChange([...artists.slice(0, index), ...artists.slice(index + 1)]);
        } else {
            setArtists([
                ...artists.slice(0, index),
                newArtistData,
                ...artists.slice(index + 1),
            ]);
            onChange([
                ...artists.slice(0, index),
                newArtistData,
                ...artists.slice(index + 1),
            ]);
        }
    };
    const onArtistAdded = (newArtistData: Artist) => {
        setQuery("");
        setArtists([...artists, newArtistData]);
        onChange([...artists, newArtistData]);
    };
    return (
        <MultiSelect2<IndexedArtist>
            tagRenderer={() => null}
            items={[]}
            selectedItems={[]}
            query={query}
            onQueryChange={(query) => {
                setQuery(query);
            }}
            itemRenderer={(artist, itemRendererProps) => (
                <MenuItem
                    text={artist.serializedFullStr}
                    key={artist.id}
                    active={itemRendererProps.modifiers.active}
                    onClick={() => {
                        onArtistAdded(
                            parseArtists(artist.serializedFullStr)[0]
                        );
                    }}
                />
            )}
            onItemSelect={(item) => {
                onArtistAdded(parseArtists(item.serializedFullStr)[0]);
            }}
            itemListPredicate={(keyword) => {
                const searchResults = AlbumFileIndexer.searchArtist(keyword);
                return uniqBy(searchResults, "serializedFullStr")
                    .map((result) => ({
                        id: result.id,
                        name: result.name,
                        serializedFullStr: result.serializedFullStr,
                    }))
                    .slice(0, 10);
            }}
            tagInputProps={{
                children: (
                    <>
                        {artists.map((artist, index) => (
                            <ArtistItem
                                artist={artist}
                                depth={0}
                                key={artist.name}
                                index={index}
                                onChange={onArtistChange}
                            />
                        ))}
                    </>
                ),
            }}
            popoverProps={{
                matchTargetWidth: true,
                minimal: true,
            }}
        />
    );
};

export default CommonArtistEditor;
