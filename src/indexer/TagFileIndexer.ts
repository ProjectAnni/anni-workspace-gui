import MiniSearch from "minisearch";
import Logger from "@/utils/log";
import { readTagFile } from "@/utils/tag";

export interface IndexedTag {
    id: string;
    type: string;
    name: string;
    includes?: string[];
    includedBy?: string;
}

class TagFileIndexer {
    needIndexFilePaths: string[] = [];
    indexedFilePaths: string[] = [];

    totalCount = 0;
    finishedCount = 0;

    tagIndex: MiniSearch<IndexedTag>;

    constructor() {
        this.tagIndex = new MiniSearch<IndexedTag>({
            fields: ["name"],
            storeFields: ["name", "type", "includes", "includedBy"],
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
        Logger.debug("Tag indexing start.");
        while (true) {
            const filePath = this.needIndexFilePaths.shift();
            if (!filePath) {
                break;
            }
            const tags = await readTagFile(filePath);
            if (tags?.length) {
                for (const tag of tags) {
                    const { name, type, includes, includedBy } = tag;
                    const id = `${type}:${name}`;
                    if (!this.tagIndex.has(id)) {
                        console.log("add", id);
                        this.tagIndex.add({
                            id,
                            name,
                            type,
                            includes,
                            includedBy,
                        });
                    }
                }
            }
            this.finishedCount += 1;
            this.indexedFilePaths.push(filePath);
        }
        Logger.debug(`Tag indexing end. finishedCount: ${this.tagIndex.documentCount}`);
    }

    searchTag(keyword: string) {
        return this.tagIndex.search(keyword);
    }
}

export default new TagFileIndexer();
