import MiniSearch from "minisearch";
import { readAlbumFile } from "@/utils/album";
import { stringifyArtist } from "@/utils/helper";
import Logger from "@/utils/log";

export interface IndexedArtist {
    id: string;
    name: string;
    serializedFullStr: string;
    albumTitle: string;
}

export interface IndexedTag {
    id: string;
    name: string;
}

class AlbumFileIndexer {
    needIndexFilePaths: string[] = [];
    indexedFilePaths: string[] = [];

    totalCount = 0;
    finishedCount = 0;

    artistIndex: MiniSearch<IndexedArtist>;

    tagIndex: MiniSearch<IndexedTag>;

    constructor() {
        this.artistIndex = new MiniSearch<IndexedArtist>({
            fields: ["name", "serializedFullStr"],
            storeFields: ["name", "serializedFullStr", "albumTitle"],
            searchOptions: {
                prefix: true,
                fuzzy: true,
            },
        });
        this.tagIndex = new MiniSearch<IndexedTag>({
            fields: ["name"],
            storeFields: ["name"],
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
        Logger.debug("Artist indexing start.");
        while (true) {
            const filePath = this.needIndexFilePaths.shift();
            if (!filePath) {
                break;
            }
            const albumData = await readAlbumFile(filePath);
            const artists = albumData.artist || [];
            const tags = albumData.tags || [];
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
            tags.forEach((tag) => {
                if (!this.tagIndex.has(tag)) {
                    this.tagIndex.add({
                        id: tag,
                        name: tag,
                    });
                }
            });
            this.finishedCount += 1;
            this.indexedFilePaths.push(filePath);
        }
        Logger.debug(`Artist indexing end. finishedCount: ${this.finishedCount}`);
    }

    searchArtist(keyword: string) {
        return this.artistIndex.search(keyword);
    }

    searchTags(keyword: string) {
        return this.tagIndex.search(keyword);
    }
}

export default new AlbumFileIndexer();
