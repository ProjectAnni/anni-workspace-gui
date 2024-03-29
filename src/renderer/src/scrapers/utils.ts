import { Artist } from "@/types/album";
import { stringifyArtists } from "@/utils/helper";

export function guessTrackType(trackTitle: string, trackArtists: Artist[]) {
    const matches = [
        {
            keywords: ["off vocal", "instrumental", "カラオケ"],
            type: "instrumental",
        },
        {
            keywords: ["drama", "ドラマ"],
            type: "drama",
        },
    ];
    for (const match of matches) {
        if (match.keywords.some((keyword) => trackTitle.toLowerCase().includes(keyword))) {
            return match.type;
        }
    }
    if (stringifyArtists(trackArtists) === "[dialogue]") {
        return "drama";
    }
    return "normal";
}
