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
                <Tab id="album_files" panel={<AlbumDirectory />} title="Albums" />
                <Tab id="tag_files" panel={<TagDirectory />} title="Tags" />
                <Tab id="workspace_status" panel={<WorkspaceStatus />} title="Workspace" />
            </Tabs>
        </div>
    );
};

export default SideBar;
