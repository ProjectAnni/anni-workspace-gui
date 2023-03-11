import axios from "axios";
import { ParsedAlbumData } from "@/types/album";
import BaseScraper, { ScraperSearchResult } from "./base";
import { parseCatalog } from "@/utils/helper";

class MusicBrainzScraper extends BaseScraper {
    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        const result1 = album.catalog ? await this.searchByCatalog(album.catalog) : [];
        return [...result1];
    }

    public async getDetail(result: ScraperSearchResult): Promise<ParsedAlbumData | null> {
        return null;
    }

    private async searchByCatalog(catalog: string): Promise<ScraperSearchResult[]> {
        const parsedCatalog = parseCatalog(catalog);
        const API = `https://musicbrainz.org/ws/2/release?query=catno:${parsedCatalog[0]}&fmt=json`;
        const searchResult = await axios.get(API).then((res) => res.data);
        const releases = searchResult?.releases;
        const result: ScraperSearchResult[] = [];
        if (!releases.length) {
            return result;
        }
        for (const release of releases) {
            result.push({
                id: release.id,
                exactMatch: true,
                title: release.title,
                artists:
                    release["artist-credit"]?.length > 0
                        ? release["artist-credit"].map((credit: any) => credit.name).join("、")
                        : "",
                releaseDate: release.date,
                trackCount: release["track-count"] || undefined,
            });
        }
        return result;
    }
}

export default new MusicBrainzScraper();
