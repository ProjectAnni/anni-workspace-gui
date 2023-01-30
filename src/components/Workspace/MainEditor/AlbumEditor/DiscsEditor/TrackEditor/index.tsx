import React from "react";
import { useAtom } from "jotai";
import { ButtonGroup, Icon } from "@blueprintjs/core";
import { ParsedDiscData, ParsedTrackData } from "@/types/album";
import TrackTitleEditor from "./TrackTitleEditor";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../../state";
import styles from "./index.module.scss";
import TrackArtistEditor from "./TrackArtistEditor";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
}

const TrackEditor: React.FC<Props> = (props) => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { track, trackIndex, disc, discIndex } = props;
    const { title } = track;

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
                    />
                </ButtonGroup>
            </div>
        </div>
    );
};

export default TrackEditor;
