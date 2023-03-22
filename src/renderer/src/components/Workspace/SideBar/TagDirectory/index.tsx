import React, { Suspense } from "react";
import { Spinner } from "@blueprintjs/core";
import styles from "./index.module.scss";
import TagFileList from "./TagFileList";

const TagDirectory: React.FC = () => {
    return (
        <div className={styles.tagDirectory}>
            <Suspense
                fallback={
                    <div className={styles.loading}>
                        <Spinner size={30} />
                    </div>
                }
            >
                <TagFileList />
            </Suspense>
        </div>
    );
};

export default TagDirectory;
