import { useCallback, useEffect, useMemo, useRef } from "react";
import { debounce, throttle } from "lodash";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

interface Props {
    onDrop: (filePath: string) => void;
}

interface DropEvent {
    payload: string[];
}

export const useFileDrop = (props: Props) => {
    const { onDrop } = props;
    const inited = useRef(false);
    const unlistenFunctionRef = useRef<UnlistenFn>();

    const onFileDrop = useCallback((event: DropEvent) => {
        onDrop && onDrop(event.payload[0]);
    }, []);

    useEffect(() => {
        if (!inited.current) {
            inited.current = true;
            listen("tauri://file-drop", (event) => {
                onFileDrop(event as DropEvent);
            }).then((fn: UnlistenFn) => {
                unlistenFunctionRef.current = fn;
            });
            return () => {
                unlistenFunctionRef.current && unlistenFunctionRef.current();
            };
        }
    });
};
