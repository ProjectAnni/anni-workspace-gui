import React from "react";
import { useAtom } from "jotai";
import { AlbumDataReducerAtom } from "../state";
import DiscInfoEditor from "./DiscInfoEditor";
import styles from "./index.module.scss";
import TrackEditor from "./TrackEditor";

const DiscsEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { discs } = albumData || {};
    if (!discs?.length) {
        return null;
    }
    return (
        <>
            {discs.map((disc, discIndex) => {
                const { tracks } = disc;
                return (
                    <div key={disc.catalog} className={styles.discContainer}>
                        <DiscInfoEditor disc={disc} index={discIndex} />
                        {tracks.map((track, trackIndex) => {
                            return (
                                <TrackEditor
                                    key={trackIndex}
                                    track={track}
                                    trackIndex={trackIndex}
                                    disc={disc}
                                    discIndex={discIndex}
                                />
                            );
                        })}
                    </div>
                );
            })}
        </>
    );
};

export default DiscsEditor;
