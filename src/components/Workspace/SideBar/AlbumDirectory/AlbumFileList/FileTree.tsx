import React, { useEffect, useRef, useState } from "react";
import { Icon, TreeNodeInfo } from "@blueprintjs/core";
import { VariableSizeTree as Tree } from "react-vtree";
import styles from "./index.module.scss";
import classNames from "classnames";
import { useAtom } from "jotai";
import { OpenedDocumentAtom } from "@/components/Workspace/state";

interface FileNodeData {
    isDirectory: boolean;
    label: string;
    nestingLevel: number;
    id: string;
    path: string;
}

interface FileNodeProps {
    data: FileNodeData;
    height: number;
    isOpen: boolean;
    style: React.CSSProperties;
    setOpen: (openStatus: boolean) => void;
}

const FileNode: React.FC<FileNodeProps> = (props: FileNodeProps) => {
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const { style, data } = props;
    const { label, nestingLevel, isDirectory, path } = data;
    return (
        <div
            style={style}
            className={classNames(styles.fileNode, {
                [styles[`level${nestingLevel}`]]: nestingLevel > 0,
                [styles.selected]: path === openedDocument.path,
            })}
            onClick={() => {
                setOpenedDocument({ label, path });
            }}
        >
            {/* {!isLeaf && (
        <button type="button" onClick={() => setOpen(!isOpen)}>
            {isOpen ? "-" : "+"}
        </button>
    )} */}
            {isDirectory ? (
                <Icon icon="folder-open" />
            ) : (
                <Icon icon="document" />
            )}
            <div className={styles.nodeLabel}>{label}</div>
        </div>
    );
};

interface Props {
    contents: TreeNodeInfo[];
}

const FileTree: React.FC<Props> = (props: Props) => {
    const { contents: treeNodes } = props;
    const containerRef = useRef<HTMLDivElement>();
    const [containerHeight, setContainerHeight] = useState(1000);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    useEffect(() => {
        const calcHeight = () => {
            if (containerRef.current) {
                const { height } = containerRef.current.getBoundingClientRect();
                setContainerHeight(height);
            }
        };
        window.addEventListener("resize", calcHeight);
        calcHeight();
    }, []);

    const onNodeClick = (node: FileNodeData) => {
        setOpenedDocument({ label: node.label, path: node.path });
    };

    const getNodeData = (node: TreeNodeInfo, nestingLevel: number) => {
        const nodeData = {
            data: {
                defaultHeight: 28,
                id: node.id as string, // mandatory
                isDirectory: !!node.childNodes?.length,
                isOpenByDefault: true, // mandatory
                nestingLevel,
                label: node.label as string,
                path: node.id as string,
                onNodeClick: () => onNodeClick(nodeData.data),
            },
            nestingLevel,
            node,
        };
        return nodeData;
    };

    // The `treeWalker` function runs only on tree re-build which is performed
    // whenever the `treeWalker` prop is changed.
    function* treeWalker() {
        // Step [1]: Define the root node of our tree. There can be one or
        // multiple nodes.
        for (let i = 0; i < treeNodes.length; i++) {
            yield getNodeData(treeNodes[i], 0);
        }

        while (true) {
            // Step [2]: Get the parent component back. It will be the object
            // the `getNodeData` function constructed, so you can read any data from it.
            const parent = yield;

            for (let i = 0; i < (parent.node.childNodes || []).length; i++) {
                // Step [3]: Yielding all the children of the provided component. Then we
                // will return for the step [2] with the first children.
                yield getNodeData(
                    parent.node.childNodes[i],
                    parent.nestingLevel + 1
                );
            }
        }
    }

    return (
        <div className={styles.fileList} ref={containerRef}>
            <Tree treeWalker={treeWalker} height={containerHeight} width={288}>
                {FileNode}
            </Tree>
        </div>
    );
};

export default FileTree;
