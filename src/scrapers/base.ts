import { ParsedAlbumData } from "@/types/album";

export interface ScraperSearchResult {
    id: string;
    exactMatch: boolean;
    title: string;
    releaseDate?: string;
    artists?: string;
    cover?: string;
    trackCount?: number;
}

abstract class BaseScraper {
    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        return [];
    }

    public async getDetail(result: ScraperSearchResult): Promise<ParsedAlbumData | null> {
        return null;
    }
}

export default BaseScraper;
