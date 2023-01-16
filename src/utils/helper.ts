import { Artist } from "@/types/album";

interface ArtistParserReader {
    data: string;
    idx: number;
}

export class ArtistParseError extends Error {}

function readArtist(reader: ArtistParserReader) {
    const res: Artist = {
        name: "",
        children: [],
    };
    // Read artist name
    while (reader.idx < reader.data.length) {
        if (reader.data[reader.idx] === "、") {
            if (reader.data[reader.idx + 1] === "、") {
                reader.idx += 1;
                res.name = res.name + "、";
            } else {
                break;
            }
        } else if (
            reader.data[reader.idx] === "（" ||
            reader.data[reader.idx] === "）"
        ) {
            break;
        } else {
            res.name = res.name + reader.data[reader.idx];
        }
        reader.idx += 1;
    }
    if (res.name === "") {
        throw new ArtistParseError("Artist parse error: empty artist name");
    }
    // Read children
    if (reader.data[reader.idx] === "（") {
        reader.idx += 1;
        do {
            res.children.push(readArtist(reader));
            reader.idx += 1;
        } while (reader.data[reader.idx - 1] === "、");
        if (reader.data[reader.idx - 1] !== "）") {
            throw new ArtistParseError(
                `Artist parse error: missing ) at ${reader.idx}`
            );
        }
    }
    return res;
}

function readArtists(reader: ArtistParserReader) {
    const res = [];
    res.push(readArtist(reader));
    while (reader.data[reader.idx] === "、") {
        reader.idx += 1;
        res.push(readArtist(reader));
    }
    return res;
}

export function parseArtists(artistStr: string) {
    return readArtists({
        data: artistStr,
        idx: 0,
    });
}

function escapeArtistName(artistName: string) {
    // regex by ChatGPT
    return artistName
        .replace(/([（）]|^、)/g, "\\$1")
        .replace(/(?<!\\)、/g, "、、");
}

export function stringifyArtist(artist: Artist): string {
    if (!artist.children?.length) {
        return escapeArtistName(artist.name);
    }
    return `${escapeArtistName(artist.name)}（${artist.children
        .map(stringifyArtist)
        .join("、")}）`;
}

export function stringifyArtists(artists: Artist[]) {
    return artists.map(stringifyArtist).join("、");
}
