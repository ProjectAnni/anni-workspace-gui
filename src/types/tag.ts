export interface Tag {
    name: string;
    type: string;
    includes?: string[];
    ["included-by"]?: string;
}

export interface ParsedTag {
    name: string;
    type: string;
    includes?: string[];
    includedBy?: string;
}
