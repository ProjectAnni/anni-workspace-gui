export const DEFAULT_COVER_FILENAME = "cover.jpg";

export const VALID_TAG_TYPES = ["artist", "group", "animation", "radio", "series", "project", "game", "organization"];

export const TAG_TYPE_DETAIL = [
    {
        value: "artist",
        label: "单艺术家",
    },
    {
        value: "group",
        label: "多艺术家组合",
    },
    {
        value: "animation",
        label: "动画",
    },
    {
        value: "radio",
        label: "广播",
    },
    {
        value: "series",
        label: "系列",
    },
    {
        value: "project",
        label: "企划",
    },
    {
        value: "game",
        label: "游戏",
    },
    {
        value: "organization",
        label: "组织、社团、公司",
    },
];

export const TAG_TYPE_TEXT_MAP: Record<string, string> = TAG_TYPE_DETAIL.reduce(
    (prev, curr) => ({ ...prev, [curr.value]: curr.label }),
    {}
);
