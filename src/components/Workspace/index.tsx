import React from "react";
import { useAtom } from "jotai";
import { WorkspaceRepoConfigAtom } from "@/components/Workspace/state";
import BottomBar from "./BottomBar";
import SideBar from "./SideBar";
import { RepositoryContext } from "./context";
import styles from "./index.module.scss";
import MainEditor from "./MainEditor";

const Workspace: React.FC = () => {
    const [repoConfig] = useAtom(WorkspaceRepoConfigAtom);
    return (
        <>
            <RepositoryContext.Provider value={repoConfig}>
                <div className={styles.main}>
                    <SideBar />
                    <MainEditor />
                </div>
                <BottomBar />
            </RepositoryContext.Provider>
        </>
    );
};

export default Workspace;
