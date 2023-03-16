import React from "react";
import { ParsedAlbumData } from "@/types/album";
import { Button, Dialog, DialogBody, DialogFooter, Intent } from "@blueprintjs/core";
import { stringifyArtists } from "@/utils/helper";
import styles from "./index.module.scss";
import { pick } from "lodash";

interface Props {
    isOpen: boolean;
    previewData: ParsedAlbumData;
    onClose: () => void;
    onApply: (data: Partial<ParsedAlbumData>) => void;
}

const ResultPreviewDialog: React.FC<Props> = (props) => {
    const { isOpen, previewData, onClose, onApply } = props;
    const { title, catalog, date, type, artist, edition, tags, discs } = previewData;
    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="预览结果" style={{ width: "60vw" }}>
            <DialogBody>
                <div className={styles.albumTitle}>
                    <div className={styles.albumTitleText}>{title}</div>
                    <div className={styles.albumAction}>
                        <Button
                            text="仅导入基本信息"
                            minimal
                            onClick={() => {
                                onApply({
                                    ...pick(previewData, [
                                        "title",
                                        "catalog",
                                        "date",
                                        "edition",
                                        "artist",
                                        "type",
                                        "tags",
                                    ]),
                                });
                            }}
                            intent={Intent.PRIMARY}
                        ></Button>
                    </div>
                </div>
                <div className={styles.divider} style={{ margin: "8px 0" }}></div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>品番</div>
                    <div className={styles.previewItemValue}>{catalog}</div>
                </div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>发售日期</div>
                    <div className={styles.previewItemValue}>{date}</div>
                </div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>版本</div>
                    <div className={styles.previewItemValue}>{edition}</div>
                </div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>类型</div>
                    <div className={styles.previewItemValue}>{type}</div>
                </div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>艺术家</div>
                    <div className={styles.previewItemValue}>{artist ? stringifyArtists(artist) : ""}</div>
                </div>
                <div className={styles.previewItem}>
                    <div className={styles.previewItemKey}>标签</div>
                    <div className={styles.previewItemValue}>{tags}</div>
                </div>
                <div style={{ margin: "8px 0" }}></div>
                {!!discs?.length &&
                    discs.map((disc, index) => {
                        const { catalog, tracks } = disc;
                        return (
                            <div className={styles.previewDisc} key={catalog}>
                                <div className={styles.discTitle}>
                                    <div>Disc {index + 1}</div>
                                    {index === 0 && (
                                        <div className={styles.discAction}>
                                            <Button
                                                text="仅导入碟片信息"
                                                minimal
                                                onClick={() => {
                                                    onApply({ discs });
                                                }}
                                                intent={Intent.PRIMARY}
                                            ></Button>
                                        </div>
                                    )}
                                </div>
                                <div className={styles.divider} style={{ margin: "8px 0" }}></div>
                                {!!tracks?.length && (
                                    <div className={styles.trackList}>
                                        {tracks.map((track, trackIndex) => {
                                            const { title, artist } = track;
                                            return (
                                                <div className={styles.trackItem} key={trackIndex}>
                                                    <div className={styles.trackHead}>
                                                        <div className={styles.trackIndex}>
                                                            {`${trackIndex + 1}`.padStart(2, "0")}.{" "}
                                                        </div>
                                                        <div className={styles.trackTitle}>{title}</div>
                                                    </div>
                                                    {!!artist && (
                                                        <div className={styles.trackArtist}>
                                                            {stringifyArtists(artist)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onClose}>取消</Button>
                        <Button
                            intent={Intent.PRIMARY}
                            onClick={() => {
                                onApply(previewData);
                                onClose();
                            }}
                        >
                            确认导入
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default ResultPreviewDialog;
