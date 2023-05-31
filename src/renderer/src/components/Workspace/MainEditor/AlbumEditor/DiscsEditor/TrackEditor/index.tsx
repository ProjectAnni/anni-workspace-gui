import React from "react";
import { useAtom } from "jotai";
import classNames from "classnames";
import { ButtonGroup, Divider, Button } from "@blueprintjs/core";
import { Artist, ParsedDiscData, ParsedTrackData } from "@/types/album";
import { ParsedTag } from "@/types/tag";
import TrackTitleEditor from "./TrackTitleEditor";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../../state";
import styles from "./index.module.scss";
import TrackArtistEditor from "./TrackArtistEditor";
import TrackTypeEditor from "./TrackTypeEditor";
import TrackTagEditor from "./TrackTagEditor";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
}

const TrackEditor: React.FC<Props> = (props) => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { track, trackIndex, disc, discIndex } = props;
    const { type: albumType } = albumData || {};
    const { type: discType } = disc;

    const onTrackTitleChange = (newTitle: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TRACK,
            payload: {
                discIndex,
                trackIndex,
                track: {
                    ...track,
                    title: newTitle,
                },
            },
        });
    };

    const onTrackArtistChange = (newArtists: Artist[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TRACK,
            payload: {
                discIndex,
                trackIndex,
                track: {
                    ...track,
                    artist: newArtists,
                },
            },
        });
    };

    const onTrackTypeChange = (newType: string) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TRACK,
            payload: {
                discIndex,
                trackIndex,
                track: {
                    ...track,
                    type: (() => {
                        if (newType === discType) {
                            return "";
                        }
                        if (newType === albumType && !discType) {
                            return "";
                        }
                        return newType;
                    })(),
                },
            },
        });
    };

    const onTrackTagChange = (newTags: ParsedTag[]) => {
        dispatch({
            type: AlbumDataActionTypes.UPDATE_TRACK,
            payload: {
                discIndex,
                trackIndex,
                track: {
                    ...track,
                    tags: newTags,
                },
            },
        });
    };

    const onTrackDelete = () => {
        dispatch({
            type: AlbumDataActionTypes.DELETE_TRACK,
            payload: {
                discIndex,
                trackIndex,
            },
        });
    };

    return (
        <div className={styles.trackItem}>
            <TrackTitleEditor
                track={track}
                trackIndex={trackIndex}
                disc={disc}
                discIndex={discIndex}
                onChange={onTrackTitleChange}
            />
            <div className={styles.secondaryActions}>
                <ButtonGroup minimal>
                    <TrackArtistEditor
                        track={track}
                        trackIndex={trackIndex}
                        disc={disc}
                        discIndex={discIndex}
                        onChange={onTrackArtistChange}
                    />
                    <Divider />
                    <TrackTypeEditor
                        track={track}
                        trackIndex={trackIndex}
                        disc={disc}
                        discIndex={discIndex}
                        onChange={onTrackTypeChange}
                    />
                    <Divider />
                    <TrackTagEditor
                        track={track}
                        trackIndex={trackIndex}
                        disc={disc}
                        discIndex={discIndex}
                        onChange={onTrackTagChange}
                    />
                    <Divider />
                    <Button
                        text="删除"
                        className={classNames(styles.secondaryActionButton, styles.danger)}
                        onClick={onTrackDelete}
                    />
                </ButtonGroup>
            </div>
        </div>
    );
};

export default TrackEditor;
