import { ParsedTag, Tag } from "@/types/tag";
import TOML from "@ltd/j-toml";
import Logger from "@/utils/log";

class DuplicatedTagError extends Error {}

export const readTagFile = async (tagFilePath: string) => {
    let content = "";
    await window.__native_bridge.fs.readTextFile(tagFilePath);
    const result: ParsedTag[] = [];
    const parsedTagFile = TOML.parse(content) as { tag?: Tag[] };
    if (parsedTagFile?.tag?.length) {
        for (const tag of parsedTagFile.tag) {
            const { name, type, includes, "included-by": includedBy } = tag;
            result.push({
                name,
                type,
                includes,
                includedBy,
            });
        }
    }
    return result;
};

export const writeTagFile = async (tagFilePath: string, tags: ParsedTag[]) => {
    Logger.debug(`Write tag file, tag_file_path: ${tagFilePath}, tags: ${JSON.stringify(tags)}`);
    let serializedTagContent = "";
    let counter = 0;
    for (const tag of tags) {
        if (counter > 0) {
            serializedTagContent += "\n";
        }
        const { name, type, includedBy, includes } = tag;
        serializedTagContent += "[[tag]]\n";
        serializedTagContent += `name = "${name}"\n`;
        serializedTagContent += `type = "${type}"\n`;
        if (includedBy?.length) {
            if (includedBy.length === 1) {
                serializedTagContent += `included-by = ["${includedBy[0]}"]\n`;
            } else {
                serializedTagContent += "included-by = ";
                serializedTagContent += JSON.stringify(includedBy, null, 2);
                serializedTagContent += "\n";
            }
        }
        if (includes?.length) {
            if (includes.length === 1) {
                serializedTagContent += `includes = ["${includes[0]}"]\n`;
            } else {
                serializedTagContent += "includes = ";
                serializedTagContent += JSON.stringify(includes, null, 2);
                serializedTagContent += "\n";
            }
        }
        counter += 1;
    }
    await window.__native_bridge.fs.writeFile(tagFilePath, serializedTagContent);
};

export const appendTagFile = async (tagFilePath: string, tag: ParsedTag) => {
    Logger.debug(`Append tag file, tag_file_path: ${tagFilePath}, tags: ${JSON.stringify(tag)}`);
    const prevTags = (await window.__native_bridge.fs.exists(tagFilePath)) ? await readTagFile(tagFilePath) : [];
    if (prevTags.some((t) => t.name === tag.name && t.type === tag.type)) {
        Logger.error(
            `Write tag file failed, duplicated tag, tag_file_path: ${tagFilePath}, tags: ${JSON.stringify(tag)}`
        );
        throw new DuplicatedTagError("Tag重复");
    }
    await writeTagFile(tagFilePath, [...prevTags, tag]);
};
