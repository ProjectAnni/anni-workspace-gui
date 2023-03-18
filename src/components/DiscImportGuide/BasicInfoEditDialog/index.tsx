import React, { useLayoutEffect, useState } from "react";
import { Button, Dialog, DialogBody, DialogFooter, FormGroup, InputGroup, Intent } from "@blueprintjs/core";
import CommonDateEditor from "@/components/Workspace/CommonDateEditor";

interface Props {
    isOpen: boolean;
    workingDirectoryName: string;
    onClose: () => void;
    onConfirm: (releaseDate: string, catalog: string, albumName: string, edition: string) => void;
}

const ALBUM_INFO_REGEX =
    /^\[(?<Year>\d{4}|\d{2})-?(?<Month>\d{2})-?(?<Date>\d{2})]\[(?<Catalog>[^\]]+)] (?<Name>.+?)(?:【(?<Edition>[^】]+)】)?(?: \[(?<DiscCount>\d+) Discs])?$/i;
const RELEASE_DATE_REGEX = /[[【(](?<Year>\d{4}|\d{2})-?(?<Month>\d{2})-?(?<Date>\d{2})[\]】)]/i;
const CATALOG_REGEX = /[[【(](?<Catalog>[A-Z]{3,4}-[0-9]{3,5})[\]】)]/i;

const BasicInfoEditDialog: React.FC<Props> = (props) => {
    const { isOpen, workingDirectoryName, onClose, onConfirm } = props;
    const [releaseDate, setReleaseDate] = useState("");
    const [catalog, setCatalog] = useState("");
    const [albumName, setAlbumName] = useState("");
    const [edition, setEdition] = useState("");
    useLayoutEffect(() => {
        const parsedDirectoryName = workingDirectoryName.match(ALBUM_INFO_REGEX);
        if (parsedDirectoryName?.groups) {
            const { Year, Month, Date, Catalog, Name, Edition, DiscCount } = parsedDirectoryName.groups;
            setReleaseDate(Year.length === 4 ? `${Year}-${Month}-${Date}` : `20${Year}-${Month}-${Date}`);
            setCatalog(Catalog);
            setAlbumName(Name);
            if (Edition) {
                setEdition(Edition);
            }
        } else {
            // guess from directory name
            const releaseDateMatchResult = workingDirectoryName.match(RELEASE_DATE_REGEX);
            if (releaseDateMatchResult?.groups) {
                const { Year, Month, Date } = releaseDateMatchResult.groups;
                setReleaseDate(Year.length === 4 ? `${Year}-${Month}-${Date}` : `20${Year}-${Month}-${Date}`);
            }
            const catalogMatchResult = workingDirectoryName.match(CATALOG_REGEX);
            if (catalogMatchResult?.groups) {
                const { Catalog } = catalogMatchResult.groups;
                setCatalog(Catalog);
            }
        }
    }, [workingDirectoryName]);
    const onButtonClick = () => {
        onConfirm(releaseDate, catalog, albumName, edition);
    };
    return (
        <Dialog
            isOpen={isOpen}
            title="请填写碟片基本信息"
            onClose={onClose}
            canEscapeKeyClose={false}
            canOutsideClickClose={false}
        >
            <DialogBody>
                <CommonDateEditor
                    initialValue={releaseDate}
                    onChange={(newDate) => {
                        setReleaseDate(newDate);
                    }}
                />
                <FormGroup label="品番" labelInfo="(required)">
                    <InputGroup
                        value={catalog}
                        onChange={(e) => {
                            setCatalog(e.target.value);
                        }}
                    />
                </FormGroup>
                <FormGroup label="碟片名" labelInfo="(required)">
                    <InputGroup
                        value={albumName}
                        onChange={(e) => {
                            setAlbumName(e.target.value);
                        }}
                    />
                </FormGroup>
                <FormGroup label="版本">
                    <InputGroup
                        value={edition}
                        placeholder="没有就留空吧"
                        onChange={(e) => {
                            setEdition(e.target.value);
                        }}
                    />
                </FormGroup>
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button intent={Intent.PRIMARY} onClick={onButtonClick}>
                            确认导入
                        </Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default BasicInfoEditDialog;
