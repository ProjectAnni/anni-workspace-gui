import { atomWithReducer } from "jotai/utils";
import { AlbumData } from "./types";

export enum AlbumDataActionTypes {
    /** 重置数据 */
    RESET,
    /** 随机一个新的ALBUM ID */
    GENERATE_NEW_ALBUM_ID,
}

type AlbumDataActionPayload =
    | {
          type: AlbumDataActionTypes.RESET;
          payload: AlbumData;
      }
    | {
          type: AlbumDataActionTypes.GENERATE_NEW_ALBUM_ID;
      };

const albumDataReducer = (
    prev: AlbumData | null,
    action: AlbumDataActionPayload
): AlbumData | null => {
    if (action.type === AlbumDataActionTypes.RESET) {
        return action.payload;
    }
    if (action.type === AlbumDataActionTypes.GENERATE_NEW_ALBUM_ID) {
        return {
            ...prev!,
            album_id: window.crypto.randomUUID(),
        };
    }
    throw new Error("unknown action type");
};

export const AlbumDataReducerAtom = atomWithReducer(null, albumDataReducer);
