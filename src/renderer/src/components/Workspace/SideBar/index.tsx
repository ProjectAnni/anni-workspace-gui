import React from "react";
import { Tab, Tabs } from "@blueprintjs/core";
import AlbumDirectory from "./AlbumDirectory";
import WorkspaceStatus from "./WorkspaceStatus";
import TagDirectory from "./TagDirectory";
import styles from "./index.module.scss";

const SideBar: React.FC = () => {
    return (
        <div className={styles.sideBar}>
            <Tabs>
                <Tab style={{ lineHeight: "2.1428em" }} id="album_files" panel={<AlbumDirectory />} title="Albums" />
                <Tab style={{ lineHeight: "2.1428em" }} id="tag_files" panel={<TagDirectory />} title="Tags" />
                <Tab
                    style={{ lineHeight: "2.1428em" }}
                    id="workspace_status"
                    panel={<WorkspaceStatus />}
                    title="Workspace"
                />
            </Tabs>
        </div>
    );
};

export default SideBar;
