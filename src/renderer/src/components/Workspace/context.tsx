import React, { useContext } from "react";
import { ExtendedRepoConfig } from "@/types/repo";

export const RepositoryContext = React.createContext<ExtendedRepoConfig | null>(null);

export const useRepository = () => {
    return useContext(RepositoryContext);
};
