import { useCallback, useEffect, useRef } from "react";

interface Props {
    onDrop: (filePath: string) => void;
}

export const useFileDrop = (props: Props) => {
    const { onDrop } = props;
    const inited = useRef(false);
    // const unlistenFunctionRef = useRef<UnlistenFn>();

    const onFileDrop = useCallback(
        (filePath: string) => {
            onDrop && onDrop(filePath);
        },
        [onDrop]
    );

    useEffect(() => {
        if (inited.current) {
            return;
        }
        inited.current = true;
        window.addEventListener("dragover", (e) => e.preventDefault());
        window.addEventListener("drop", (e) => {
            if (e.dataTransfer?.files?.[0]) {
                onFileDrop(e.dataTransfer.files[0].path);
            }
        });
    }, [onFileDrop]);
};
