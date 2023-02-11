import { fetch, ResponseType } from "@tauri-apps/api/http";

export interface CoverItem {
    id: string;
    thumbnailUrl: string;
    originUrl: string;
}

export const searchCoverFromITunes = async (keyword: string) => {
    const url = `https://itunes.apple.com/search?term=${keyword}&country=jp&media=music&entity=album`;
    const response = await fetch<any>(url, {
        method: "GET",
        responseType: ResponseType.JSON,
    });
    const results = response.data?.results;
    const covers: CoverItem[] = [];
    for (const result of results) {
        const { collectionId, artworkUrl100 } = result;
        if (collectionId && artworkUrl100) {
            covers.push({
                id: collectionId,
                thumbnailUrl: artworkUrl100.replace("100x100", "250x250"),
                originUrl: artworkUrl100.replace("100x100", "10000x10000"),
            });
        }
    }
    return covers;
};

export const downloadCover = async (url: string) => {
    const response = await fetch<number[]>(url, {
        method: "GET",
        responseType: ResponseType.Binary,
    });
    return new Uint8Array(response.data);
};
