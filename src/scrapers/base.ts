import { ParsedAlbumData } from "@/types/album";

interface ScraperSearchResult {
    id: string;
    exactMatch: boolean;
    title: string;
    cover?: string;
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
