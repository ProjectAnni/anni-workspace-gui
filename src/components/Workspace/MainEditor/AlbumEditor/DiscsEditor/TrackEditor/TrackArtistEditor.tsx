import React from "react";
import { Button } from "@blueprintjs/core";
import { ParsedTrackData, ParsedDiscData } from "@/types/album";
import { stringifyArtists } from "@/utils/helper";
import styles from "./index.module.scss";

interface Props {
    trackIndex: number;
    track: ParsedTrackData;
    discIndex: number;
    disc: ParsedDiscData;
}

const TrackArtistEditor: React.FC<Props> = (props) => {
    const { track } = props;
    const { artist } = track;
    return !!artist ? (
        <div className={styles.secondaryActionText}>
            <span className={styles.prefix}>主艺术家: </span>
            <span>{stringifyArtists(artist)}</span>
        </div>
    ) : (
        <Button minimal className={styles.secondaryActionButton}>
            设置艺术家
        </Button>
    );
};

export default TrackArtistEditor;
