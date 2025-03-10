import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';

import DialogManager from '../../DialogManager/DialogManager';

import {ExportInfo} from './ExportInfo/ExportInfo';

import './ExportWorkbookDialog.scss';

const b = block('export-workbook-file-dialog');

const i18n = I18n.keyset('component.workbook-export-dialog.view');

export type Props = {
    open: boolean;
    workbookId: string;
    onClose: () => void;
};

export const DIALOG_EXPORT_WORKBOOK = Symbol('DIALOG_EXPORT_WORKBOOK');

export type OpenDialogExportWorkbookArgs = {
    id: typeof DIALOG_EXPORT_WORKBOOK;
    props: Props;
};

type ExportState = 'info' | 'loading' | 'error' | 'success';

const getApplyButtonText = (state: ExportState) => {
    switch (state) {
        case 'info':
        case 'loading':
            return i18n('button_begin-export');
        case 'success':
            return i18n('button_download');
        case 'error':
        default:
            return undefined;
    }
};

const getCaption = (state: ExportState) => {
    switch (state) {
        case 'info':
        case 'loading':
            return i18n('title_export');
        case 'error':
            return i18n('title_fatal-error');
        case 'success':
            return i18n('title_export-success');
        default:
            return i18n('title_export');
    }
};

export const ExportWorkbookDialog: React.FC<Props> = ({open, onClose}) => {
    const [state, setState] = React.useState<ExportState>('info');
    const isLoading = state === 'loading';

    const handleClose = React.useCallback(() => {
        onClose();
    }, [onClose]);

    const handleCancel = React.useCallback(() => {
        if (state === 'loading') {
            // TODO: add cancel modal
            return;
        }
        handleClose();
    }, [handleClose, state]);

    const handleApply = React.useCallback(() => {
        if (state === 'info') {
            setState('loading');
            // dispatch();
            return;
        }

        if (state === 'success') {
            // await donwload file

            handleClose();
        }
    }, [handleClose, state]);

    const cancelButtonText =
        state === 'info' || state === 'loading' ? i18n('button_cancel') : i18n('button_close');

    const renderBody = () => {
        switch (state) {
            case 'info':
                return <ExportInfo />;
            case 'loading':
                return <ProgressBar size="s" className={b('progress')} value={50} />;
            case 'success':
                return <div>Success</div>;
            case 'error':
            default:
                return <div>Error</div>;
        }
    };

    return (
        <Dialog className={b()} open={open} onClose={handleClose} onEscapeKeyDown={handleClose}>
            <Dialog.Header caption={getCaption(state)} />
            <Dialog.Body>{renderBody()}</Dialog.Body>
            <Dialog.Footer
                textButtonApply={getApplyButtonText(state)}
                textButtonCancel={cancelButtonText}
                onClickButtonApply={handleApply}
                onClickButtonCancel={handleCancel}
                propsButtonApply={{loading: isLoading}}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EXPORT_WORKBOOK, ExportWorkbookDialog);
