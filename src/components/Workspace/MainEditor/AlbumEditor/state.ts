import { atomWithReducer } from "jotai/utils";
import { Artist, ParsedAlbumData } from "@/types/album";

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
    /** 设置主艺术家 */
    UPDATE_ARTIST,
    /** 设置Tags */
    UPDATE_TAGS,
    /** 设置Type */
    UPDATE_TYPE,
    /** 设置碟片标题 */
    UPDATE_DISC_TITLE,
    /** 设置碟片品番 */
    UPDATE_DISC_CATALOG,
    /** 删除碟片 */
    DELETE_DISC,
}

type AlbumDataActionPayload =
    | {
          type: AlbumDataActionTypes.RESET;
          payload: ParsedAlbumData;
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
      }
    | {
          type: AlbumDataActionTypes.UPDATE_ARTIST;
          payload: Artist[];
      }
    | {
          type: AlbumDataActionTypes.UPDATE_TAGS;
          payload: string[];
      }
    | {
          type: AlbumDataActionTypes.UPDATE_TYPE;
          payload: string;
      }
    | {
          type: AlbumDataActionTypes.UPDATE_DISC_TITLE;
          payload: {
              index: number;
              title: string;
          };
      }
    | {
          type: AlbumDataActionTypes.UPDATE_DISC_CATALOG;
          payload: {
              index: number;
              catalog: string;
          };
      }
    | {
          type: AlbumDataActionTypes.DELETE_DISC;
          payload: {
              index: number;
          };
      };

const albumDataReducer = (
    prev: ParsedAlbumData | null,
    action: AlbumDataActionPayload
): ParsedAlbumData | null => {
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
    if (action.type === AlbumDataActionTypes.UPDATE_ARTIST) {
        return {
            ...prev!,
            artist: action.payload,
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_TAGS) {
        return {
            ...prev!,
            tags: action.payload,
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_TYPE) {
        return {
            ...prev!,
            type: action.payload,
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_DISC_TITLE) {
        return {
            ...prev!,
            discs: [
                ...prev!.discs.slice(0, action.payload.index),
                {
                    ...prev!.discs[action.payload.index],
                    title: action.payload.title,
                },
                ...prev!.discs.slice(action.payload.index + 1),
            ],
        };
    }
    if (action.type === AlbumDataActionTypes.UPDATE_DISC_CATALOG) {
        return {
            ...prev!,
            discs: [
                ...prev!.discs.slice(0, action.payload.index),
                {
                    ...prev!.discs[action.payload.index],
                    catalog: action.payload.catalog,
                },
                ...prev!.discs.slice(action.payload.index + 1),
            ],
        };
    }
    if (action.type === AlbumDataActionTypes.DELETE_DISC) {
        return {
            ...prev!,
            discs: [
                ...prev!.discs.slice(0, action.payload.index),
                ...prev!.discs.slice(action.payload.index + 1),
            ],
        };
    }
    throw new Error("unknown action type");
};

export const AlbumDataReducerAtom = atomWithReducer(null, albumDataReducer);
