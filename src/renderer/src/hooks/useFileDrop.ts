import { useCallback, useEffect, useRef } from "react";

interface Props {
    onDrop: (filePath: string[]) => void;
}

export const useFileDrop = (props: Props) => {
    const { onDrop } = props;
    const inited = useRef(false);
    // const unlistenFunctionRef = useRef<UnlistenFn>();

    const onFileDrop = useCallback(
        (filePaths: string[]) => {
            onDrop && onDrop(filePaths);
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
            if (e.dataTransfer?.files?.length) {
                onFileDrop(Array.from(e.dataTransfer.files).map((f) => f.path));
            }
        });
    }, [onFileDrop]);
};
