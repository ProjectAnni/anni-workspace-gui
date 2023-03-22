export interface RepoConfig {
    name: string;
    edition: string;
    albums?: string[];
}

export interface ExtendedRepoConfig extends RepoConfig {
    albumPaths: string[];
}
