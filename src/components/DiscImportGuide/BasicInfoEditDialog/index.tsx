import React, { useEffect, useState } from "react";
import { Dialog, DialogBody, FormGroup, InputGroup } from "@blueprintjs/core";

interface Props {
    isOpen: boolean;
    workingDirectoryName: string;
}

const ALBUM_INFO_REGEX =
    /^\[(?<Year>\d{4}|\d{2})-?(?<Month>\d{2})-?(?<Date>\d{2})]\[(?<Catalog>[^\]]+)] (?<Name>.+?)(?:【(?<Edition>[^】]+)】)?(?: \[(?<DiscCount>\d+) Discs])?$/i;

const BasicInfoEditDialog: React.FC<Props> = (props) => {
    const { isOpen, workingDirectoryName } = props;
    const [releaseDate, setReleaseDate] = useState("");
    const [catalog, setCatalog] = useState("");
    const [albumName, setAlbumName] = useState("");
    useEffect(() => {
        const parsedDirectoryName = workingDirectoryName.match(ALBUM_INFO_REGEX);
        if (parsedDirectoryName?.groups) {
            const { Year, Month, Date, Catalog, Name, Edition, DiscCount } = parsedDirectoryName.groups;
            setReleaseDate(Year.length === 4 ? `${Year}-${Month}-${Date}` : `20${Year}-${Month}-${Year}`);
            setCatalog(Catalog);
            setAlbumName(Name);
        }
    }, [workingDirectoryName]);
    return (
        <Dialog isOpen={isOpen} title="基本信息">
            <DialogBody>
                <FormGroup label="发售日期">
                    <InputGroup value={releaseDate} />
                </FormGroup>
                <FormGroup label="品番">
                    <InputGroup value={catalog} />
                </FormGroup>
                <FormGroup label="碟片名">
                    <InputGroup value={albumName} />
                </FormGroup>
            </DialogBody>
        </Dialog>
    );
};

export default BasicInfoEditDialog;
