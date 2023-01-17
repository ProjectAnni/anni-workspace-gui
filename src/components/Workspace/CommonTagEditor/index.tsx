import { MenuItem } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import React, { useState } from "react";
import { CategoryTags } from "./constants";

interface Props {
    initialTags: string[];
    onChange: (tags: string[]) => void;
}

const CommonTagEditor: React.FC<Props> = (props) => {
    const { initialTags, onChange } = props;
    const [tags, setTags] = useState(initialTags);

    const onItemSelect = (tag: string) => {
        setTags([...tags, tag]);
        onChange([...tags, tag]);
    };
    const onItemRemove = (tag: string, index: number) => {
        setTags([...tags.slice(0, index), ...tags.slice(index + 1)]);
        onChange([...tags.slice(0, index), ...tags.slice(index + 1)]);
    };
    const createNewItemFromQuery = (tag: string) => tag;
    return (
        <MultiSelect2<string>
            resetOnSelect
            items={CategoryTags}
            selectedItems={tags}
            itemRenderer={(tag, itemProps) => {
                return (
                    <MenuItem
                        text={tag}
                        active={itemProps.modifiers.active}
                        key={tag}
                        onClick={() => {
                            onItemSelect(tag);
                        }}
                    />
                );
            }}
            tagRenderer={(tag) => tag}
            itemPredicate={(query, item) => item.includes(query)}
            onItemSelect={onItemSelect}
            onRemove={onItemRemove}
            createNewItemFromQuery={createNewItemFromQuery}
            popoverProps={{
                matchTargetWidth: true,
                minimal: true,
            }}
        />
    );
};

export default CommonTagEditor;
