import React, { useEffect, useState, useRef } from "react";
import { Tab, TabId, Tabs } from "@blueprintjs/core";
import AlbumDirectory from "./AlbumDirectory";
import WorkspaceStatus from "./WorkspaceStatus";
import TagDirectory from "./TagDirectory";
import styles from "./index.module.scss";

const SideBar: React.FC = () => {
    const [selectedTabId, setSelectedTabId] = useState<TabId>("album_files");
    const unlistenFunctionRef = useRef<() => void>();
    const isInitialized = useRef(false);

    useEffect(() => {
        if (isInitialized.current) {
            return;
        }

        isInitialized.current = true;
        unlistenFunctionRef.current = window.__native_bridge.events.onWorkspaceStatusChange(() => {
            setSelectedTabId("workspace_status");
        });

        return () => {
            unlistenFunctionRef.current && unlistenFunctionRef.current();
        };
    }, []);

    return (
        <div className={styles.sideBar}>
            <Tabs
                selectedTabId={selectedTabId}
                onChange={(tabId) => {
                    setSelectedTabId(tabId);
                }}
            >
                <Tab id="album_files" panel={<AlbumDirectory />} title="Albums" />
                <Tab id="tag_files" panel={<TagDirectory />} title="Tags" />
                <Tab id="workspace_status" panel={<WorkspaceStatus />} title="Workspace" />
            </Tabs>
        </div>
    );
};

export default SideBar;
