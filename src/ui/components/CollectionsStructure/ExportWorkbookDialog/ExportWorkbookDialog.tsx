import React from 'react';

import {Dialog, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import {ViewError} from 'ui/components/ViewError/ViewError';
import {exportWorkbook, resetExportWorkbook} from 'ui/store/actions/collectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    selectExportWorkbook,
    selectExportWorkbookStatus,
} from 'ui/store/selectors/collectionsStructure';

import DialogManager from '../../DialogManager/DialogManager';
import {EntriesNotificationCut} from '../components/EntriesNotificationCut/EntriesNotificationCut';
import type {ImportExportStatus} from '../types';

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

type DialogView = 'info' | 'export';

const getApplyButtonText = (view: DialogView, status: ImportExportStatus) => {
    if (view === 'info' || status === 'loading') {
        return i18n('button_begin-export');
    }
    switch (status) {
        case 'success':
            return i18n('button_download');
        case 'fatal-error':
        case 'notification-error':
        default:
            return undefined;
    }
};

const getCaption = (view: DialogView, status: ImportExportStatus) => {
    if (view === 'info' || status === 'loading') {
        return i18n('title_export');
    }
    switch (status) {
        case 'fatal-error':
        case 'notification-error':
            return i18n('title_fatal-error');
        case 'success':
            return i18n('title_export-success');
        default:
            return i18n('title_export');
    }
};

export const ExportWorkbookDialog: React.FC<Props> = ({workbookId, open, onClose}) => {
    const dispatch = useDispatch();

    const [view, setView] = React.useState<DialogView>('info');
    const status = useSelector(selectExportWorkbookStatus);

    const {data, error, progress} = useSelector(selectExportWorkbook);

    const isLoading = status === 'loading';

    React.useEffect(() => {
        if (open) {
            dispatch(resetExportWorkbook());
        }
    }, [dispatch, open]);

    const handleCancel = React.useCallback(() => {
        if (isLoading) {
            dispatch(
                openDialog({
                    id: DIALOG_DEFAULT,
                    props: {
                        open: true,
                        onApply: () => {
                            // TODO: cancel request
                            dispatch(closeDialog());
                            onClose();
                        },
                        onCancel: () => dispatch(closeDialog()),
                        message: i18n('label_cancel-export-description'),
                        textButtonApply: i18n('button_cancel-export'),
                        textButtonCancel: i18n('button_back-to-export'),
                        propsButtonApply: {view: 'outlined-danger'},
                        caption: i18n('title_cancel-export'),
                        className: b('import-cancel-dialog'),
                    },
                }),
            );

            return;
        }

        onClose();
    }, [dispatch, isLoading, onClose]);

    const handleApply = React.useCallback(() => {
        if (view === 'info') {
            setView('export');
            dispatch(exportWorkbook({workbookId}));
            return;
        }

        if (status === 'success') {
            // await donwload file

            onClose();
        }
    }, [dispatch, onClose, status, view, workbookId]);

    const cancelButtonText =
        view === 'info' || isLoading ? i18n('button_cancel') : i18n('button_close');

    const renderBody = () => {
        if (view === 'info') {
            return <ExportInfo />;
        }
        switch (status) {
            case 'loading':
                return <ProgressBar size="s" className={b('progress')} value={progress} />;
            case 'success':
            case 'notification-error':
                if (!data) {
                    return null;
                }
                if (!data.notifications?.length) {
                    return (
                        <EntriesNotificationCut
                            title={i18n('label_success-export')}
                            level="success"
                        />
                    );
                }
                return (
                    <Flex direction="column" gap={4} className={b('notifications')}>
                        {data.notifications.map((notification) => (
                            <EntriesNotificationCut
                                key={notification.code}
                                title={notification.message}
                                level={notification.level}
                                entries={notification.entries}
                            />
                        ))}
                    </Flex>
                );
            case 'fatal-error':
            default:
                return <ViewError containerClassName={b('error-content')} error={error} size="s" />;
        }
    };

    return (
        <Dialog className={b()} open={open} onClose={handleCancel} onEscapeKeyDown={handleCancel}>
            <Dialog.Header caption={getCaption(view, status)} />
            <Dialog.Body>{renderBody()}</Dialog.Body>
            <Dialog.Footer
                textButtonApply={getApplyButtonText(view, status)}
                textButtonCancel={cancelButtonText}
                onClickButtonApply={handleApply}
                onClickButtonCancel={handleCancel}
                propsButtonApply={{loading: isLoading}}
            />
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EXPORT_WORKBOOK, ExportWorkbookDialog);
