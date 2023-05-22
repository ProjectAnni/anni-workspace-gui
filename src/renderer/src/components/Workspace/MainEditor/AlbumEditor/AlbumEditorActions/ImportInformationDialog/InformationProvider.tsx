import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { Card, Icon, Intent, Spinner, Tag } from "@blueprintjs/core";
import type BaseScraper from "@/scrapers/base";
import type { ParsedAlbumData } from "@/types/album";
import { ScraperSearchResult } from "@/scrapers/base";
import { AppToaster } from "@/utils/toaster";
import ResultPreviewDialog from "./ResultPreviewDialog";
import styles from "./index.module.scss";

interface Props {
    active: boolean;
    name: string;
    albumData: ParsedAlbumData;
    scraper: BaseScraper;
    onApply: (albumData: Partial<ParsedAlbumData>) => void;
}

const InformationProvider: React.FC<Props> = (props) => {
    const { active, name, albumData, scraper, onApply } = props;
    const { data, error, isLoading } = useSWR(active ? ["scraper-search", name, albumData] : null, () => {
        return scraper.search(albumData);
    });
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [generatingId, setGeneratingId] = useState<string>();
    const [generatedResult, setGeneratedResult] = useState<ParsedAlbumData>();
    const [isShowResultPreviewDialog, setIsShowResultPreviewDialog] = useState(false);

    const onClick = useCallback(
        async (item: ScraperSearchResult) => {
            setGeneratingId(item.id);
            try {
                const generatedResult = await scraper.getDetail(item);
                if (generatedResult) {
                    setGeneratedResult({ ...generatedResult, album_id: albumData.album_id });
                    setIsShowResultPreviewDialog(true);
                } else {
                    throw new Error("生成信息失败");
                }
            } catch (e) {
                if (e instanceof Error) {
                    AppToaster.show({ message: e.message, intent: Intent.DANGER });
                }
            } finally {
                setGeneratingId("");
            }
        },
        [albumData.album_id, scraper]
    );

    const resultNode = useMemo(() => {
        if (isLoading) {
            return (
                <div className={styles.loading}>
                    <Spinner size={24} />
                </div>
            );
        }
        if (!data?.length) {
            return <div className={styles.noResult}>无匹配结果</div>;
        }
        if (error) {
            return <div className={styles.error}>发生了一些错误</div>;
        }
        return (
            <div className={styles.resultList}>
                {data.slice(0, isCollapsed ? 2 : data.length).map((item) => {
                    const { id, title, edition, artists, releaseDate, trackCount, exactMatch } = item;
                    return (
                        <div
                            className={styles.resultItem}
                            key={id}
                            onClick={() => {
                                onClick(item);
                            }}
                        >
                            <div className={styles.left}>
                                <div className={styles.resultTitle}>
                                    <span>
                                        {title}
                                        {edition ? `【${edition}】` : ""}
                                    </span>
                                    {exactMatch && (
                                        <Tag intent={Intent.PRIMARY} className={styles.exactMatchTag} minimal>
                                            完全匹配
                                        </Tag>
                                    )}
                                </div>
                                {!!artists && (
                                    <div className={styles.resultSubTitle}>
                                        {artists}
                                        {releaseDate ? ` / ${releaseDate}` : ""}
                                        {trackCount ? ` / ${trackCount} tracks` : ""}
                                    </div>
                                )}
                            </div>
                            <div className={styles.right}>{generatingId === item.id && <Spinner size={24} />}</div>
                        </div>
                    );
                })}
                {isCollapsed && data.length > 2 && (
                    <div
                        className={styles.expand}
                        onClick={() => {
                            setIsCollapsed(false);
                        }}
                    >
                        <Icon icon="expand-all"></Icon>
                        展开更多
                    </div>
                )}
            </div>
        );
    }, [isLoading, data, error, isCollapsed, generatingId, onClick]);

    return (
        <div className={styles.informationProviderContainer}>
            <h3>{name}</h3>
            <div className={styles.divider}></div>
            <Card className={styles.resultCard}>{resultNode}</Card>
            {!!generatedResult && (
                <ResultPreviewDialog
                    isOpen={isShowResultPreviewDialog}
                    previewData={generatedResult}
                    onClose={() => {
                        setIsShowResultPreviewDialog(false);
                    }}
                    onApply={(data) => {
                        AppToaster.show({ message: "导入成功", intent: Intent.SUCCESS });
                        onApply(data);
                    }}
                />
            )}
        </div>
    );
};

export default InformationProvider;
