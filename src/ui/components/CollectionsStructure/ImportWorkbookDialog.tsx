import React from 'react';

import {Dialog, Progress, TextInput} from '@gravity-ui/uikit';
import axios from 'axios';

import DialogManager from '../../components/DialogManager/DialogManager';
import {getSdk} from '../../libs/schematic-sdk';

export type Props = {
    open: boolean;
    initialCollectionId?: string | null;
    onClose: () => void;
};

export const DIALOG_IMPORT_WORKBOOK = Symbol('DIALOG_IMPORT_WORKBOOK');

export type OpenDialogImportWorkbookArgs = {
    id: typeof DIALOG_IMPORT_WORKBOOK;
    props: Props;
};

export const ImportWorkbookDialog: React.FC<Props> = ({
    open,
    // initialCollectionId = null,
    onClose,
}) => {
    const [progress, setProgress] = React.useState<number>(0);
    const [title, setTitle] = React.useState<string>();
    const [file, setFile] = React.useState<File>();

    const handleUploadFile = React.useCallback((event) => {
        setFile(event.target.files[0]);
    }, []);

    const [isLoading, setIsLoading] = React.useState(false);

    const startImport = React.useCallback(() => {
        if (title && file) {
            setIsLoading(true);

            const url = 'http://localhost:3001/workbooks/import';
            const formData = new FormData();
            formData.append('file', file);
            formData.append('fileName', file.name);
            formData.append('title', title);
            const config = {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            };
            axios
                .post<any, {data: {importId: string}}>(url, formData, config)
                .then(async (response) => {
                    let isReady = false;
                    while (!isReady) {
                        await new Promise((resolve) => {
                            setTimeout(resolve, 3000);
                        });

                        try {
                            const importWorkbook = await getSdk().transfer.getImportStatus({
                                importId: response.data.importId,
                            });

                            setProgress(importWorkbook.progress);

                            if (importWorkbook.status === 'success') {
                                isReady = true;
                                window.location.reload();
                                onClose();
                            }
                        } catch (err) {}
                    }
                });
        }
    }, [file, onClose, title]);

    return (
        <Dialog open={open} onClose={onClose}>
            <Dialog.Header caption="Import workbook" />
            <Dialog.Body>
                <div>Title:</div>
                <div>
                    <TextInput value={title} onUpdate={setTitle} />
                </div>
                <br />
                <div>Upload the export file:</div>
                <div>
                    <input type="file" onChange={handleUploadFile} />
                </div>
                {isLoading ? (
                    <React.Fragment>
                        <br />
                        <Progress text="Importing" theme="misc" value={progress} loading={true} />
                    </React.Fragment>
                ) : null}
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={startImport}
                textButtonApply="Start import"
                propsButtonApply={{
                    disabled: isLoading || !file || !title,
                    loading: isLoading,
                }}
                textButtonCancel="Cancel"
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_IMPORT_WORKBOOK, ImportWorkbookDialog);
