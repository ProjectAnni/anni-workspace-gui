import { ParsedTag, Tag } from "@/types/tag";
import TOML from "@ltd/j-toml";
import { fs } from "@tauri-apps/api";
import { processTauriError } from "./error";

export const readTagFile = async (tagFilePath: string) => {
    let content = "";
    try {
        content = await fs.readTextFile(tagFilePath);
    } catch (e) {
        throw processTauriError(e);
    }
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
