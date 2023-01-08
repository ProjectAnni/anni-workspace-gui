import { useAtom } from "jotai";
import React, { useMemo } from "react";
import { WorkspaceRepoConfigAtom } from "@/components/Workspace/state";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import { RepositoryContext } from "./context";
import styles from "./index.module.scss";

const Workspace: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    return (
        <>
            <RepositoryContext.Provider value={repoConfig}>
                <div className={styles.main}>
                    <SideBar />
                </div>
                <BottomBar />
            </RepositoryContext.Provider>
        </>
    );
};

export default Workspace;
