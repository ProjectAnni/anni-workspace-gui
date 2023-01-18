import React from "react";
import { useAtom } from "jotai";
import { AlbumDataReducerAtom } from "../state";
import DiscInfoEditor from "./DiscInfoEditor";
import styles from "./index.module.scss";

const DiscsEditor: React.FC = () => {
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const { discs } = albumData || {};
    if (!discs?.length) {
        return null;
    }
    return (
        <>
            {discs.map((disc, index) => {
                return (
                    <>
                        <DiscInfoEditor disc={disc} index={index} />
                        <div className={styles.discTitleDivider}></div>
                    </>
                );
            })}
        </>
    );
};

export default DiscsEditor;
