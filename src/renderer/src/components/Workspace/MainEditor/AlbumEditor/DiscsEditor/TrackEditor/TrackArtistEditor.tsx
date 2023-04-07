import React, { useState } from "react";
import { Button, Card } from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { ParsedTrackData, ParsedDiscData, Artist } from "@/types/album";
import CommonArtistEditor from "@/components/Workspace/CommonArtistEditor";
import { stringifyArtists } from "@/utils/helper";
import LocalAlbumFileIndexer from "../../indexer";
import styles from "./index.module.scss";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
    onChange: (newArtists: Artist[]) => void;
}

const TrackArtistEditor: React.FC<Props> = (props) => {
    const { track, onChange } = props;
    const { artist } = track;
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
                <div
                    className={styles.secondaryActionText}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                >
                    <span className={styles.prefix}>主艺术家: </span>
                    <span title="点击设置主艺术家">{stringifyArtists(artist)}</span>
                </div>
            ) : (
                <Button
                    minimal
                    className={styles.secondaryActionButton}
                    onClick={() => {
                        setIsShowInputCard(true);
                    }}
                >
                    设置艺术家
                </Button>
            )}
        </>
    );
};

export default TrackArtistEditor;
