import React, { useMemo } from "react";
import useSWR from "swr";
import { Card, Spinner } from "@blueprintjs/core";
import type BaseScraper from "@/scrapers/base";
import type { ParsedAlbumData } from "@/types/album";
import styles from "./index.module.scss";

interface Props {
    name: string;
    albumData: ParsedAlbumData;
    scraper: BaseScraper;
}

const InformationProvider: React.FC<Props> = (props) => {
    const { name, albumData, scraper } = props;
    const { data, error, isLoading } = useSWR(`${name}-search`, () => {
        return scraper.search(albumData);
    });
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
    }, [isLoading, data, error]);
    return (
        <div className={styles.informationProviderContainer}>
            <h3>{name}</h3>
            <div className={styles.divider}></div>
            <Card className={styles.resultCard}>{resultNode}</Card>
        </div>
    );
};

export default InformationProvider;
