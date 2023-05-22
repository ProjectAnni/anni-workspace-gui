import { ParsedAlbumData } from "@/types/album";

export interface ScraperSearchResult {
    id: string;
    exactMatch: boolean;
    title: string;
    edition?: string;
    releaseDate?: string;
    artists?: string;
    cover?: string;
    trackCount?: number;

    searchParams: {
        catalog?: string;
        title?: string;
    };
}

abstract class BaseScraper {
    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        return [];
    }

    public async getDetail(result: ScraperSearchResult): Promise<Omit<ParsedAlbumData, "album_id"> | null> {
        return null;
    }
}

export default BaseScraper;
