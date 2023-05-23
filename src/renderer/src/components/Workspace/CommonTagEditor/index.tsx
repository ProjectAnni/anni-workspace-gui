import React, { useState } from "react";
import { uniqBy } from "lodash";
import { Menu, MenuItem, Tag } from "@blueprintjs/core";
import { MultiSelect2 } from "@blueprintjs/select";
import TagFileIndexer from "@/indexer/TagFileIndexer";
import CreateTagDialog from "./CreateTagDialog";

interface Props {
    initialTags: string[];
    autoFocus?: boolean;
    allowCreate?: boolean;
    onChange: (tags: string[]) => void;
}

interface TagItem {
    name: string;
    type?: string;
    isNew?: boolean;
}

const CommonTagEditor: React.FC<Props> = (props) => {
    const { initialTags, autoFocus = false, allowCreate = true, onChange } = props;
    const [query, setQuery] = useState("");
    const [tags, setTags] = useState(initialTags);
    const [isShowCreateTagDialog, setIsShowCreateTagDialog] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const onItemSelect = (tag: TagItem) => {
        setQuery("");
        if (tag.isNew) {
            setNewTagName(tag.name.slice(3));
            setIsShowCreateTagDialog(true);
        } else if (TagFileIndexer.isTagNameUnique(tag.name)) {
            setTags([...tags, tag.name]);
            onChange([...tags, tag.name]);
        } else if (tag.type) {
            setTags([...tags, `${tag.type}:${tag.name}`]);
            onChange([...tags, `${tag.type}:${tag.name}`]);
        }
    };

    const onItemRemove = (tag: TagItem, index: number) => {
        setTags([...tags.slice(0, index), ...tags.slice(index + 1)]);
        onChange([...tags.slice(0, index), ...tags.slice(index + 1)]);
    };

    const onTagCreated = (tagName: string, tagType: string) => {
        TagFileIndexer.addTag({ id: crypto.randomUUID(), name: tagName, type: tagType });
        onItemSelect({ name: tagName, type: tagType });
        setIsShowCreateTagDialog(false);
    };

    return (
        <>
            <MultiSelect2<TagItem>
                query={query}
                onQueryChange={setQuery}
                items={[]}
                selectedItems={tags.map((tag) => ({ name: tag }))}
                tagRenderer={(tag) => {
                    return <Tag style={{ lineHeight: "normal" }}>{tag.name}</Tag>;
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
                itemListRenderer={({ filteredItems, activeItem, query }) => {
                    if (!query) {
                        return null;
                    }
                    return (
                        <>
                            <Menu>
                                {filteredItems.map((item) => {
                                    const { name, type } = item;
                                    return (
                                        <MenuItem
                                            text={name}
                                            active={activeItem === item}
                                            key={`${type}:${name}`}
                                            onClick={() => {
                                                onItemSelect(item);
                                            }}
                                        />
                                    );
                                })}
                            </Menu>
                        </>
                    );
                }}
                itemListPredicate={(query) => {
                    const searchResults = TagFileIndexer.searchTag(query);
                    const result: TagItem[] = uniqBy(searchResults, "serializedFullStr")
                        .map((result) => ({
                            id: result.id,
                            name: result.name,
                            type: result.type,
                        }))
                        .slice(0, 10);
                    if (!result.some((r) => r.name === query) && allowCreate) {
                        result.push({
                            name: `创建：${query}`,
                            isNew: true,
                        });
                    }
                    return result;
                }}
                tagInputProps={{
                    inputProps: {
                        autoFocus,
                    },
                }}
                onItemSelect={onItemSelect}
                onRemove={onItemRemove}
                popoverProps={{
                    matchTargetWidth: true,
                    minimal: true,
                }}
                resetOnSelect
            />
            {allowCreate && (
                <CreateTagDialog
                    isOpen={isShowCreateTagDialog}
                    newTagName={newTagName}
                    key={newTagName}
                    onClose={() => {
                        setIsShowCreateTagDialog(false);
                    }}
                    onCreated={onTagCreated}
                />
            )}
        </>
    );
};

export default CommonTagEditor;
