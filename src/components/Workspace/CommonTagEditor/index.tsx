import React, { useState } from "react";
import { MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect2, Suggest2 } from "@blueprintjs/select";
import TagFileIndexer, { IndexedTag } from "@/indexer/TagFileIndexer";
import { CategoryTags } from "./constants";
import { uniqBy } from "lodash";

interface Props {
    initialTags: string[];
    onChange: (tags: string[]) => void;
}

interface TagItem {
    name: string;
    type?: string;
}

const CommonTagEditor: React.FC<Props> = (props) => {
    const { initialTags, onChange } = props;
    const [tags, setTags] = useState(initialTags);

    const onItemSelect = (tag: TagItem) => {
        setTags([...tags, tag.name]);
        onChange([...tags, tag.name]);
    };
    const onItemRemove = (tag: TagItem, index: number) => {
        setTags([...tags.slice(0, index), ...tags.slice(index + 1)]);
        onChange([...tags.slice(0, index), ...tags.slice(index + 1)]);
    };
    // TODO: Create Tag
    const createNewItemFromQuery = (tag: string) => tag;
    return (
        <MultiSelect2<TagItem>
            items={[]}
            selectedItems={tags.map((tag) => ({ name: tag }))}
            tagRenderer={(tag) => {
                return <Tag>{tag.name}</Tag>;
            }}
            itemRenderer={(tag, itemProps) => {
                const { name, type } = tag;
                return (
                    <MenuItem
                        text={name}
                        active={itemProps.modifiers.active}
                        key={`${type}:${name}`}
                        onClick={() => {
                            onItemSelect(tag);
                        }}
                    />
                );
            }}
            itemListPredicate={(keyword) => {
                const searchResults = TagFileIndexer.searchTag(keyword);
                return uniqBy(searchResults, "serializedFullStr")
                    .map((result) => ({
                        id: result.id,
                        name: result.name,
                        type: result.type,
                    }))
                    .slice(0, 10);
            }}
            onItemSelect={onItemSelect}
            onRemove={onItemRemove}
            // createNewItemFromQuery={createNewItemFromQuery}
            popoverProps={{
                matchTargetWidth: true,
                minimal: true,
            }}
            resetOnSelect
        />
    );
};

export default CommonTagEditor;
