import MiniSearch from "minisearch";
import { uniqBy } from "lodash";
import AlbumFileIndexer, { IndexedArtist } from "@/indexer/AlbumFileIndexer";
import { stringifyArtist } from "@/utils/helper";
import { Artist } from "@/types/album";

class LocalAlbumFileIndexer {
    artistIndex: MiniSearch<IndexedArtist>;

    constructor() {
        this.artistIndex = new MiniSearch<IndexedArtist>({
            fields: ["name", "serializedFullStr"],
            storeFields: ["name", "serializedFullStr", "albumTitle"],
            searchOptions: {
                prefix: true,
                fuzzy: true,
            },
        });
    }

    add(artist: Artist) {
        this.artistIndex.add({
            name: artist.name,
            serializedFullStr: stringifyArtist(artist),
            id: `local-${crypto.randomUUID()}`,
            albumTitle: "当前专辑",
        });
    }

    clear() {
        this.artistIndex.removeAll();
    }

    searchArtist(keyword: string): IndexedArtist[] {
        const searchResults = [...this.artistIndex.search(keyword), ...AlbumFileIndexer.searchArtist(keyword)];
        return uniqBy(searchResults, "serializedFullStr")
            .map((result) => ({
                id: result.id,
                name: result.name,
                serializedFullStr: result.serializedFullStr,
                albumTitle: result.albumTitle,
            }))
            .slice(0, 10);
    }
}

export default new LocalAlbumFileIndexer();
