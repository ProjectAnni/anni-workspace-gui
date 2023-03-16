import React from "react";
import { useAtom } from "jotai";
import { Button, Dialog, DialogBody, DialogFooter } from "@blueprintjs/core";
import MusicBrainzScraper from "@/scrapers/musicbrainz";
import VGMDBScraper from "@/scrapers/vgmdb";
import type BaseScraper from "@/scrapers/base";
import { ParsedAlbumData } from "@/types/album";
import { AlbumDataActionTypes, AlbumDataReducerAtom } from "../../state";
import InformationProvider from "./InformationProvider";

interface Source {
    name: string;
    scraper: BaseScraper;
}

const SOURCES: Source[] = [
    {
        name: "MusicBrainz",
        scraper: MusicBrainzScraper,
    },
    {
        name: "VGMdb",
        scraper: VGMDBScraper,
    },
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

const ImportInformationDialog: React.FC<Props> = (props) => {
    const { isOpen, onClose } = props;
    const [albumData, dispatch] = useAtom(AlbumDataReducerAtom);
    const onApply = (data: Partial<ParsedAlbumData>) => {
        if (!albumData || !data) {
            return;
        }
        dispatch({
            type: AlbumDataActionTypes.RESET,
            payload: {
                ...albumData,
                ...data,
            },
        });
    };
    if (!albumData) {
        return null;
    }
    return (
        <Dialog isOpen={isOpen} title="导入信息" style={{ width: "60vw" }} onClose={onClose}>
            <DialogBody>
                {SOURCES.map((source) => {
                    const { name, scraper } = source;
                    return (
                        <InformationProvider
                            active={isOpen}
                            key={name}
                            name={name}
                            albumData={albumData}
                            scraper={scraper}
                            onApply={onApply}
                        />
                    );
                })}
            </DialogBody>
            <DialogFooter
                actions={
                    <>
                        <Button onClick={onClose}>没用的按钮</Button>
                    </>
                }
            ></DialogFooter>
        </Dialog>
    );
};

export default ImportInformationDialog;
