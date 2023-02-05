import MiniSearch from "minisearch";
import { readAlbumFile } from "@/utils/album";
import { stringifyArtist } from "@/utils/helper";

export interface IndexedArtist {
    id: string;
    name: string;
    serializedFullStr: string;
    albumTitle: string;
}

class AlbumFileIndexer {
    needIndexFilePaths: string[] = [];
    indexedFilePaths: string[] = [];

    totalCount = 0;
    finishedCount = 0;

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

    addPaths(paths: string[]) {
        this.needIndexFilePaths.push(...paths);
        this.totalCount = this.needIndexFilePaths.length;
    }

    async start() {
        if (!this.needIndexFilePaths.length) {
            return;
        }
        while (true) {
            const filePath = this.needIndexFilePaths.shift();
            if (!filePath) {
                break;
            }
            const albumData = await readAlbumFile(filePath);
            const artists = albumData.artist || [];
            artists.forEach((artist, index) => {
                const { name } = artist;
                if (!this.artistIndex.has(`${albumData.album_id}-${index}`)) {
                    this.artistIndex.add({
                        name,
                        serializedFullStr: stringifyArtist(artist),
                        id: `${albumData.album_id}-${index}`,
                        albumTitle: albumData.title || "",
                    });
                }
            });
            this.finishedCount += 1;
            this.indexedFilePaths.push(filePath);
        }
    }

    searchArtist(keyword: string) {
        return this.artistIndex.search(keyword);
    }
}

export default new AlbumFileIndexer();
