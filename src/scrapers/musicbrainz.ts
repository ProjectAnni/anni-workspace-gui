import axios from "axios";
import { ParsedAlbumData } from "@/types/album";
import BaseScraper, { ScraperSearchResult } from "./base";
import { parseCatalog } from "@/utils/helper";
import { uniqBy } from "lodash";

class MusicBrainzScraper extends BaseScraper {
    public async search(album: ParsedAlbumData): Promise<ScraperSearchResult[]> {
        const [result1, result2] = await Promise.all([
            album.catalog ? this.searchByCatalog(album.catalog) : Promise.resolve([]),
            album.title ? this.searchByTitle(album.title) : Promise.resolve([]),
        ]);
        return uniqBy([...result1, ...result2], "id");
    }

    public async getDetail(result: ScraperSearchResult): Promise<Omit<ParsedAlbumData, "id"> | null> {
        return null;
    }
    private async searchByTitle(title: string): Promise<ScraperSearchResult[]> {
        const API = `https://musicbrainz.org/ws/2/release?query=${title}&limit=10&fmt=json`;
        const searchResult = await axios.get(API).then((res) => res.data);
        const releases = searchResult?.releases;
        const result: ScraperSearchResult[] = [];
        if (!releases.length) {
            return result;
        }
        for (const release of releases) {
            result.push({
                id: release.id,
                exactMatch: release.title === title,
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
            if (release["label-info"].some((labelInfo: any) => labelInfo["catalog-number"] === parsedCatalog[0])) {
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
        }
        return result;
    }
}

export default new MusicBrainzScraper();
