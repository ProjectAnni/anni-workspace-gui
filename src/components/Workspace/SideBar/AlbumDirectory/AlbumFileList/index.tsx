import React, { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { Tree, TreeEventHandler, TreeNodeInfo } from "@blueprintjs/core";
import { OpenedDocumentAtom } from "@/components/Workspace/state";
import { AlbumDirectoriesAtom } from "../state";
import { convertDirectoriesToTreeNodes } from "../utils";
import styles from "./index.module.scss";
import FileTree from "./FileTree";

const AlbumFileList: React.FC = () => {
    const albumDirectories = useAtomValue(AlbumDirectoriesAtom);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const [treeContent, setTreeContent] = useState<TreeNodeInfo[]>();
    useEffect(() => {
        if (!albumDirectories?.length) {
            return;
        }
        const content: TreeNodeInfo[] = convertDirectoriesToTreeNodes(
            albumDirectories,
            openedDocument
        );
        setTreeContent(content);
    }, [albumDirectories, openedDocument]);
    if (!treeContent) {
        return null;
    }
    return <FileTree contents={treeContent} />;
};

export default AlbumFileList;
