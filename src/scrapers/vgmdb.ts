import axios from "axios";
import { ParsedAlbumData } from "@/types/album";
import BaseScraper, { ScraperSearchResult } from "./base";

class VGMDBScraper extends BaseScraper {
    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        return [];
    }

    public async getDetail(result: ScraperSearchResult): Promise<ParsedAlbumData | null> {
        return null;
    }
}

export default new VGMDBScraper();
