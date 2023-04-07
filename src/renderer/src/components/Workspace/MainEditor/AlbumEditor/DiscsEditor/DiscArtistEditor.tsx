import React, { useState } from "react";
import classNames from "classnames";
import { Button, Card } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { stringifyArtists } from "@/utils/helper";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { Artist, ParsedDiscData } from "@/types/album";
import LocalAlbumFileIndexer from "../indexer";
import styles from "./index.module.scss";

interface Props {
    disc: ParsedDiscData;
    onChange: (newArtists: Artist[]) => void;
}

const DiscArtistEditor: React.FC<Props> = (props) => {
    const { disc, onChange } = props;
    const { artist } = disc || {};
    const [localArtists, setLocalArtists] = useState<Artist[]>(artist || []);
    const [isShowInputCard, setIsShowInputCard] = useState(false);

    const onArtistSearch = (keyword: string) => {
        return LocalAlbumFileIndexer.searchArtist(keyword);
    };

    const onArtistChange = (newArtists: Artist[]) => {
        setLocalArtists(newArtists);
        onChange(newArtists);
    };
    return (
        <>
            <Popover2
                isOpen={isShowInputCard}
                minimal
                content={
                    <Card
                        className={styles.inputCard}
                        style={{
                            width: "auto",
                            minWidth: "3rem",
                            maxWidth: "calc(100vw - 2.88rem)",
                        }}
                        onClick={(e) => {
                            // 阻止点击冒泡（防止点击候选项导致popover关闭)
                            e.stopPropagation();
                        }}
                    >
                        <CommonArtistEditor
                            autoFocus
                            initialArtists={localArtists}
                            onSearch={onArtistSearch}
                            onChange={onArtistChange}
                        />
                    </Card>
                }
                position="bottom-left"
                modifiers={{
                    preventOverflow: {
                        enabled: false,
                    },
                }}
                onInteraction={(nextOpenState, e) => {
                    setIsShowInputCard(nextOpenState);
                }}
                targetTagName="div"
            >
                <div className={styles.popoverAnchor}></div>
            </Popover2>
            {artist?.length ? (
                <>
                    <div
                        className={classNames(styles.secondaryActionText, styles.discArtist)}
                        onClick={() => {
                            setIsShowInputCard(true);
                        }}
                    >
                        <span title="点击设置艺术家">{stringifyArtists(artist)}</span>
                    </div>
                </>
            ) : (
                <Button
                    text="设置艺术家"
                    minimal
                    className={styles.secondaryActionButton}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                />
            )}
        </>
    );
};

export default DiscArtistEditor;
