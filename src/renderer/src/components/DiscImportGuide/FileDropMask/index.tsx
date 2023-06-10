import React, { useCallback } from "react";
import { useFileDrop } from "@/hooks/useFileDrop";
import EventBus from "@/utils/event_bus";
import { ALBUM_DIRECTORY_DROP_EVENT } from "../constants";

const FileDropMask: React.FC = () => {
    const onFileDrop = useCallback((filePath: string) => {
        EventBus.send(ALBUM_DIRECTORY_DROP_EVENT, { filePath });
    }, []);

    useFileDrop({ onDrop: onFileDrop });

    return null;
};

export default FileDropMask;
