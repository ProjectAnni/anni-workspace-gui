import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import {
    Button,
    Dialog,
    DialogBody,
    DialogFooter,
    FormGroup,
    InputGroup,
    Intent,
    Menu,
    MenuItem,
    Spinner,
} from "@blueprintjs/core";
import { Popover2 } from "@blueprintjs/popover2";
import { AppToaster } from "@/utils/toaster";
import Logger from "@/utils/log";
import { CoverItem, searchCoverFromITunes } from "../services";
import styles from "./index.module.scss";

interface Props {
    keyword: string;
    isOpen: boolean;
    onCoverSelected: (url: string) => void | Promise<void>;
    onClose: () => void;
}

const CoverSearchDialog: React.FC<Props> = (props) => {
    const { keyword, isOpen, onClose, onCoverSelected } = props;
    const [localKeyword, setLocalKeyword] = useState(keyword || "");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<CoverItem[]>([]);
    const requestLock = useRef(false);
    const onKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalKeyword(e.target.value);
    };
    const onSearch = async () => {
        if (requestLock.current || !localKeyword) {
            return;
        }
        requestLock.current = true;
        setIsLoading(true);
        try {
            Logger.debug("Search cover from internet");
            const results = await searchCoverFromITunes(localKeyword);
            Logger.debug(`Got ${results.length} covers from internet`);
            setSearchResults(results.slice(0, 12));
        } catch (e) {
            if (e instanceof Error) {
                Logger.error(`搜索封面失败: ${e.message}, channel: iTunes`);
                AppToaster.show({ message: `搜索封面失败: ${e.message}`, intent: Intent.DANGER });
            }
        } finally {
            setIsLoading(false);
            requestLock.current = false;
        }
    };
    useEffect(() => {
        onSearch();
    }, []);
    return (
        <Dialog title="搜索封面" isOpen={isOpen} onClose={onClose}>
            <DialogBody>
                <FormGroup label="关键词">
                    <InputGroup
                        value={localKeyword}
                        onChange={onKeywordChange}
                        leftElement={
                            <Popover2
                                content={
                                    <Menu>
                                        <MenuItem text="iTunes" />
                                    </Menu>
                                }
                                placement="bottom-start"
                            >
                                <Button minimal rightIcon="caret-down">
                                    iTunes
                                </Button>
                            </Popover2>
                        }
                        rightElement={<Button minimal icon="search" onClick={onSearch}></Button>}
                        onKeyDown={(e) => {
                            console.log(e.key);
                            if (e.key === "Enter") {
                                onSearch();
                            }
                        }}
                    />
                </FormGroup>
                <div className={styles.divider} />
                <div className={styles.resultContainer}>
                    {isLoading ? (
                        <div className={styles.loading}>
                            <Spinner size={36} />
                        </div>
                    ) : (
                        <>
                            {!!searchResults.length ? (
                                <div className={styles.coverItemList}>
                                    {searchResults.map((result, index) => {
                                        const { id, thumbnailUrl, originUrl } = result;
                                        return (
                                            <div
                                                className={classNames(styles.coverItem, {
                                                    [styles.first]: index % 4 === 0,
                                                })}
                                                key={id}
                                                onClick={() => {
                                                    onCoverSelected(originUrl);
                                                }}
                                            >
                                                <img src={thumbnailUrl}></img>
                                                <div className={styles.coverItemActions}>选择</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <>No Results</>
                            )}
                        </>
                    )}
                </div>
            </DialogBody>
        </Dialog>
    );
};

export default CoverSearchDialog;
