import React, { useCallback, useEffect, useRef, useState } from "react";
import { VariableSizeTree as Tree } from "react-vtree";
import { useAtom } from "jotai";
import classNames from "classnames";
import { Icon, InputGroup, NonIdealState, TreeNodeInfo } from "@blueprintjs/core";
import { OpenedDocumentAtom } from "@/components/Workspace/state";
import styles from "./index.module.scss";

interface FileNodeData {
    defaultHeight: number;
    isOpenByDefault: boolean;
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
    setOpen: (openStatus: boolean) => Promise<void>;
}

const FileNode: React.FC<FileNodeProps> = (props: FileNodeProps) => {
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);
    const { style, data, isOpen, setOpen } = props;
    const { label, nestingLevel, isDirectory, path } = data;
    return (
        <div
            style={style}
            className={classNames(styles.fileNode, {
                [styles[`level${nestingLevel}`]]: nestingLevel > 0,
                [styles.selected]: path === openedDocument.path,
            })}
            onClick={() => {
                if (openedDocument.path == path) {
                    return;
                }
                if (isDirectory) {
                    setOpen(!isOpen);
                } else {
                    setOpenedDocument({ label, path });
                }
            }}
        >
            {isDirectory ? <Icon icon="folder-open" /> : <Icon icon="document" />}
            <div className={styles.nodeLabel}>{label}</div>
        </div>
    );
};

interface Props {
    contents: TreeNodeInfo[];
}

const FileTree: React.FC<Props> = (props: Props) => {
    const { contents: treeNodes } = props;
    const containerRef = useRef<HTMLDivElement>(null);
    const treeRef = useRef<Tree<any>>(null);
    const [containerHeight, setContainerHeight] = useState(1000);
    const [keyword, setKeyword] = useState("");
    const [filteredTreeNodes, setFilteredTreeNodes] = useState(treeNodes);
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
        for (let i = 0; i < filteredTreeNodes.length; i++) {
            yield getNodeData(filteredTreeNodes[i], 0);
        }

        while (true) {
            // Step [2]: Get the parent component back. It will be the object
            // the `getNodeData` function constructed, so you can read any data from it.
            const parent: { node: TreeNodeInfo; nestingLevel: number } = yield;

            for (let i = 0; i < (parent.node.childNodes || []).length; i++) {
                // Step [3]: Yielding all the children of the provided component. Then we
                // will return for the step [2] with the first children.
                yield getNodeData(parent.node.childNodes![i], parent.nestingLevel + 1);
            }
        }
    }

    const filterTreeNode = (node: TreeNodeInfo, keyword: string): TreeNodeInfo | null => {
        if ((node.label as string).includes(keyword)) {
            return node;
        }
        if (node.childNodes?.length) {
            const matchedChildNodes = node.childNodes.filter((node) => filterTreeNode(node, keyword));
            if (matchedChildNodes.length > 0) {
                return {
                    ...node,
                    childNodes: matchedChildNodes,
                };
            } else {
                return null;
            }
        }
        return null;
    };

    const onKeywordChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newKeyword = e.target.value;
            if (!newKeyword) {
                setFilteredTreeNodes(treeNodes);
            }
            const result = treeNodes.map((node) => filterTreeNode(node, newKeyword));
            const nonNullNode = (node: TreeNodeInfo | null): node is TreeNodeInfo => node !== null;
            setKeyword(newKeyword);
            setFilteredTreeNodes(result.filter(nonNullNode));
        },
        [treeNodes]
    );

    return (
        <div className={styles.fileList} ref={containerRef}>
            <InputGroup leftIcon="filter" small onChange={onKeywordChange} />

            {!!keyword && !filteredTreeNodes?.length ? (
                <div className={styles.noResult}>
                    <NonIdealState
                        title="无匹配内容"
                        description="目前只支持搜索文件名，试试换个关键词？"
                        icon="search"
                    ></NonIdealState>
                </div>
            ) : (
                <Tree
                    // @ts-ignore
                    treeWalker={treeWalker}
                    height={containerHeight - 24}
                    width={288}
                    ref={treeRef}
                >
                    {/** @ts-ignore */}
                    {FileNode}
                </Tree>
            )}
        </div>
    );
};

export default FileTree;
