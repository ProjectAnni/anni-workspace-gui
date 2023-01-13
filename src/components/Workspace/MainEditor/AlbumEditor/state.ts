import { atomWithReducer } from "jotai/utils";
import { AlbumData } from "./types";

export enum AlbumDataActionTypes {
    /** 重置数据 */
    RESET,
    /** 随机一个新的ALBUM ID */
    GENERATE_NEW_ID,
    /** 设置标题 */
    UPDATE_TITLE,
    /** 设置品番 */
    UPDATE_CATALOG,
    /** 设置发售日期 */
    UPDATE_RELEASE_DATE,
}

type AlbumDataActionPayload =
    | {
          type: AlbumDataActionTypes.RESET;
          payload: AlbumData;
      }
    | {
          type: AlbumDataActionTypes.GENERATE_NEW_ID;
      }
    | {
          type: AlbumDataActionTypes.UPDATE_TITLE;
          payload: string;
      }
    | {
          type: AlbumDataActionTypes.UPDATE_CATALOG;
          payload: string;
      }
    | {
          type: AlbumDataActionTypes.UPDATE_RELEASE_DATE;
          payload: string;
      };

const albumDataReducer = (
    prev: AlbumData | null,
    action: AlbumDataActionPayload
): AlbumData | null => {
    if (action.type === AlbumDataActionTypes.RESET) {
        return action.payload;
    }
    if (action.type === AlbumDataActionTypes.GENERATE_NEW_ID) {
        return {
            ...prev!,
            album_id: window.crypto.randomUUID(),
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_TITLE) {
        return {
            ...prev!,
            title: action.payload,
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_CATALOG) {
        return {
            ...prev!,
            catalog: action.payload,
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_RELEASE_DATE) {
        return {
            ...prev!,
            date: action.payload,
        };
    }
    throw new Error("unknown action type");
};

export const AlbumDataReducerAtom = atomWithReducer(null, albumDataReducer);
