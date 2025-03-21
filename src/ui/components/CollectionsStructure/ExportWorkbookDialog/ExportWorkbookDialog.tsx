import React from 'react';

import {Dialog, Flex, Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import {ViewError} from 'ui/components/ViewError/ViewError';
import type {AppDispatch} from 'ui/store';
import {
    exportWorkbook,
    getExportProgress,
    resetExportWorkbook,
} from 'ui/store/actions/collectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    selectExportWorkbook,
    selectExportWorkbookStatus,
    selectGetExportProgress,
} from 'ui/store/selectors/collectionsStructure';

import DialogManager from '../../DialogManager/DialogManager';
import {EntriesNotificationCut} from '../components/EntriesNotificationCut/EntriesNotificationCut';
import {transformNotifications} from '../components/EntriesNotificationCut/helpers';
import type {ImportExportStatus} from '../types';

import {ExportInfo} from './ExportInfo/ExportInfo';

import './ExportWorkbookDialog.scss';

const b = block('export-workbook-file-dialog');

const i18n = I18n.keyset('component.workbook-export-dialog.view');

const GET_EXPORT_PROGRESS_INTERVAL = 1000;

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
    if (view === 'info' || status === 'loading' || status === 'pending') {
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
    if (view === 'info' || status === 'loading' || status === 'pending') {
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
    const dispatch: AppDispatch = useDispatch();

    const [view, setView] = React.useState<DialogView>('info');
    const status = useSelector(selectExportWorkbookStatus);

    const {error} = useSelector(selectExportWorkbook);
    const {data: progressData} = useSelector(selectGetExportProgress);
    const progress = progressData?.progress;
    const notifications = progressData?.notifications;

    const exportProgressTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = React.useCallback(() => true, []);

    const preparedNotifications = React.useMemo(() => {
        if (!notifications) {
            return [];
        }

        return transformNotifications(notifications);
    }, [notifications]);

    const isLoading = status === 'loading' || status === 'pending';

    React.useEffect(() => {
        if (open) {
            dispatch(resetExportWorkbook());
        }
    }, [dispatch, open]);

    const pollExportStatus = React.useCallback(
        async (currentExportId: string) => {
            if (exportProgressTimeout.current) {
                clearTimeout(exportProgressTimeout.current);
            }

            if (!isMounted()) {
                return;
            }

            const startTime = Date.now();

            const result = await dispatch(getExportProgress({exportId: currentExportId}));

            const elapsedTime = Date.now() - startTime;

            if (result && result.status === 'pending') {
                const nextPollDelay = Math.max(0, GET_EXPORT_PROGRESS_INTERVAL - elapsedTime);
                exportProgressTimeout.current = setTimeout(
                    () => pollExportStatus(currentExportId),
                    nextPollDelay,
                );
            }
        },
        [dispatch, isMounted],
    );

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

    const handleApply = React.useCallback(async () => {
        if (view === 'info') {
            setView('export');
            const exportResult = await dispatch(exportWorkbook({workbookId}));
            if (exportResult && exportResult.exportId) {
                pollExportStatus(exportResult.exportId);
            }
            return;
        }

        if (status === 'success') {
            // await donwload file

            onClose();
        }
    }, [dispatch, onClose, pollExportStatus, status, view, workbookId]);

    const cancelButtonText =
        view === 'info' || isLoading ? i18n('button_cancel') : i18n('button_close');

    const renderBody = () => {
        if (view === 'info') {
            return <ExportInfo />;
        }
        switch (status) {
            case 'pending':
                return <ProgressBar size="s" className={b('progress')} value={progress ?? 0} />;
            case 'loading':
                return (
                    <Flex alignItems="center" justifyContent="center">
                        <Loader size="m" />
                    </Flex>
                );
            case 'success':
            case 'notification-error':
                if (!notifications) {
                    return null;
                }
                if (!preparedNotifications.length) {
                    return (
                        <EntriesNotificationCut
                            title={i18n('label_success-export')}
                            level="success"
                        />
                    );
                }
                return (
                    <Flex direction="column" gap={4} className={b('notifications')}>
                        {preparedNotifications.map((notification) => (
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
