import React, { useMemo, useState } from "react";
import useSWR from "swr";
import { Card, Icon, Intent, Spinner, Tag } from "@blueprintjs/core";
import type BaseScraper from "@/scrapers/base";
import type { ParsedAlbumData } from "@/types/album";
import styles from "./index.module.scss";
import { ScraperSearchResult } from "@/scrapers/base";
import { serializeAlbumData } from "@/utils/album";

interface Props {
    active: boolean;
    name: string;
    albumData: ParsedAlbumData;
    scraper: BaseScraper;
}

const InformationProvider: React.FC<Props> = (props) => {
    const { active, name, albumData, scraper } = props;
    const { data, error, isLoading } = useSWR(active ? ["scraper-search", name, albumData] : null, () => {
        return scraper.search(albumData);
    });
    const [isCollapsed, setIsCollapsed] = useState(true);

    const onClick = async (item: ScraperSearchResult) => {
        const generatedResult = await scraper.getDetail(item);
        if (generatedResult) {
            const toml = await serializeAlbumData({ ...generatedResult, album_id: albumData.album_id });
            console.log(toml);
        }
    };

    const resultNode = useMemo(() => {
        if (isLoading) {
            return <Spinner size={24} />;
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
    }, [isLoading, data, error, isCollapsed]);
    return (
        <div className={styles.informationProviderContainer}>
            <h3>{name}</h3>
            <div className={styles.divider}></div>
            <Card className={styles.resultCard}>{resultNode}</Card>
        </div>
    );
};

export default InformationProvider;
