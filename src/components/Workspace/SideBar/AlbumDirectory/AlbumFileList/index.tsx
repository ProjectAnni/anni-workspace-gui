import React, { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { TreeNodeInfo } from "@blueprintjs/core";
import { OpenedDocumentAtom } from "@/components/Workspace/state";
import { AlbumDirectoriesContentAtom } from "../state";
import { convertDirectoriesToTreeNodes } from "../utils";
import FileTree from "./FileTree";

const AlbumFileList: React.FC = () => {
    const albumDirectories = useAtomValue(AlbumDirectoriesContentAtom);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const [treeContent, setTreeContent] = useState<TreeNodeInfo[]>();
    useEffect(() => {
        if (!albumDirectories?.length) {
            return;
        }
        const content: TreeNodeInfo[] = convertDirectoriesToTreeNodes(albumDirectories, openedDocument);
        setTreeContent(content);
    }, [albumDirectories, openedDocument]);
    if (!treeContent) {
        return null;
    }
    return <FileTree contents={treeContent} />;
};

export default AlbumFileList;
