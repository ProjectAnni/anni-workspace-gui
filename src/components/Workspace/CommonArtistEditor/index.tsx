import React, { useState, useRef, MutableRefObject } from "react";
import classNames from "classnames";
import { Artist } from "@/types/album";
import { Icon, InputGroup, TagInput } from "@blueprintjs/core";
import { AppToaster } from "@/utils/toaster";
import styles from "./index.module.scss";

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
    const floatInputRef: MutableRefObject<HTMLInputElement | null> =
        useRef(null);
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
                            <span className={styles.childLength}>
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
                <InputGroup
                    style={{
                        position: "fixed",
                        left: floatingInputLeft,
                        top: floatingInputTop,
                        width: "200px",
                    }}
                    inputRef={(ref) => {
                        if (ref) {
                            ref.focus();
                            floatInputRef.current = ref;
                        }
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onFocus={(e) => {
                        e.stopPropagation();
                    }}
                    onBlur={() => {
                        setIsShowFloatInput(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.code === "Enter" && floatInputRef.current) {
                            onChildAdded({
                                name: floatInputRef.current.value,
                                children: [],
                            });
                        }
                    }}
                ></InputGroup>
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
    return (
        <TagInput values={[]}>
            {artists.map((artist, index) => (
                <ArtistItem
                    artist={artist}
                    depth={0}
                    key={artist.name}
                    index={index}
                    onChange={onArtistChange}
                />
            ))}
        </TagInput>
    );
};

export default CommonArtistEditor;
