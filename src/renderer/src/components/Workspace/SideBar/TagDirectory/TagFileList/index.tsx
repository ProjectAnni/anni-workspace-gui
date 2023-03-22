import React from "react";
import classNames from "classnames";
import { useAtom, useAtomValue } from "jotai";
import { Icon } from "@blueprintjs/core";
import { OpenedDocumentAtom, OpenedDocumentType } from "@/components/Workspace/state";
import { TagDirectoryContentAtom } from "../state";
import styles from "./index.module.scss";

const TagFileList: React.FC = () => {
    const tagFiles = useAtomValue(TagDirectoryContentAtom);
    const [openedDocument, setOpenedDocument] = useAtom(OpenedDocumentAtom);

    const onFileClick = (tagFile: { label: string; path: string }) => {
        const { label, path } = tagFile;
        setOpenedDocument({ label, path, type: OpenedDocumentType.TAG });
    };

    if (!tagFiles?.length) {
        return null;
    }

    return (
        <div className={styles.tagDirectoryContainer}>
            <div className={styles.fileList}>
                {tagFiles.map((tagFile) => {
                    const { label, path } = tagFile;
                    return (
                        <div
                            key={path}
                            className={classNames(styles.fileNode, {
                                [styles.selected]: openedDocument.path === path,
                            })}
                            onClick={() => {
                                onFileClick(tagFile);
                            }}
                        >
                            <Icon icon="document" />
                            <div className={styles.nodeLabel}>{label}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TagFileList;
