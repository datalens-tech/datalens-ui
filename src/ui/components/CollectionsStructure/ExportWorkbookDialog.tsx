import React from 'react';

import {Dialog} from '@gravity-ui/uikit';

import DialogManager from '../../components/DialogManager/DialogManager';
import {getSdk} from '../../libs/schematic-sdk';

export type Props = {
    open: boolean;
    workbookId: string;
    workbookTitle: string;
    onClose: () => void;
};

export const DIALOG_EXPORT_WORKBOOK = Symbol('DIALOG_EXPORT_WORKBOOK');

export type OpenDialogExportWorkbookArgs = {
    id: typeof DIALOG_EXPORT_WORKBOOK;
    props: Props;
};

export const ExportWorkbookDialog: React.FC<Props> = ({
    open,
    workbookId,
    workbookTitle,
    onClose,
}) => {
    const [isLoading, setIsLoading] = React.useState(false);

    const startExport = React.useCallback(() => {
        setIsLoading(true);

        getSdk()
            .transfer.startExport({workbookId})
            .then(async ({exportId}) => {
                let isReady = false;
                while (!isReady) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 1000);
                    });

                    try {
                        const exportWorkbook = await getSdk().transfer.getExportStatus({exportId});

                        if (exportWorkbook.status === 'success') {
                            isReady = true;
                            setIsLoading(false);

                            // Create blob link to download
                            const url = window.URL.createObjectURL(
                                new Blob([JSON.stringify(exportWorkbook.data)]),
                            );
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', `export-${exportId}.json`);

                            // Append to html link element page
                            document.body.appendChild(link);

                            // Start download (close modal TODO: use ref)
                            link.click();

                            // Clean up and remove the link
                            link.parentNode?.removeChild(link);
                        }
                    } catch (err) {}
                }
            });
    }, [workbookId]);

    return (
        <Dialog open={open} onClose={onClose}>
            <Dialog.Header caption="Export workbook" />
            <Dialog.Body>
                <div>Export &quot;{workbookTitle}&quot;?</div>
                <div> It may take a few minutes, don&apos;t close the dialog.</div>
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonCancel={onClose}
                onClickButtonApply={startExport}
                textButtonApply="Start export"
                propsButtonApply={{
                    disabled: isLoading,
                    loading: isLoading,
                }}
                textButtonCancel="Cancel"
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EXPORT_WORKBOOK, ExportWorkbookDialog);
