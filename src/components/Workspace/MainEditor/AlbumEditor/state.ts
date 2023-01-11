import { atomWithReducer } from "jotai/utils";
import { AlbumData } from "./types";

export enum AlbumDataActionTypes {
    /** 重置数据 */
    RESET,
}

type AlbumDataActionPayload = {
    type: AlbumDataActionTypes.RESET;
    payload: AlbumData;
};

const albumDataReducer = (
    prev: AlbumData | null,
    action: AlbumDataActionPayload
) => {
    if (action.type === AlbumDataActionTypes.RESET) {
        return action.payload;
    }
    throw new Error("unknown action type");
};

export const AlbumDataReducerAtom = atomWithReducer(null, albumDataReducer);
