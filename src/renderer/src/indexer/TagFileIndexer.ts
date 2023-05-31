import MiniSearch from "minisearch";
import Logger from "@/utils/log";
import { readTagFile } from "@/utils/tag";
import { parseTags } from "@/utils/helper";

export interface IndexedTag {
    id: string;
    type?: string;
    name: string;
    includes?: string[];
    includedBy?: string[];
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

    addTag(tag: IndexedTag) {
        this.tagIndex.add(tag);
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
                        this.tagIndex.add({
                            id,
                            name,
                            type,
                            includes,
                            includedBy,
                        });
                        if (includes?.length) {
                            const includedTags = parseTags(includes);
                            for (const tag of includedTags) {
                                const subId = `${tag.type}:${tag.name}`;
                                if (!this.tagIndex.has(subId)) {
                                    this.tagIndex.add({
                                        id: subId,
                                        name: tag.name,
                                        type: tag.type,
                                    });
                                }
                            }
                        }
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

    isTagNameUnique(tagName: string) {
        const searchResult = this.searchTag(tagName).filter((item) => item.name === tagName);
        return searchResult.length === 1;
    }
}

export default new TagFileIndexer();
