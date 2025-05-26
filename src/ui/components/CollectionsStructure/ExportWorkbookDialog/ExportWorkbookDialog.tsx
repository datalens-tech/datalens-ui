import React from 'react';

import {Button, Dialog, Flex, Link, Loader, spacing} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {ProgressBar} from 'ui/components/ProgressBar/ProgressBar';
import {ViewError} from 'ui/components/ViewError/ViewError';
import type {AppDispatch} from 'ui/store';
import {
    cancelExportProcess,
    exportWorkbook,
    getExportProgress,
    getExportResult,
    resetExportWorkbook,
} from 'ui/store/actions/collectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {
    selectExportData,
    selectExportError,
    selectExportWorkbookStatus,
    selectGetExportProgressData,
    selectGetExportProgressEntriesMap,
    selectGetExportResultLoading,
} from 'ui/store/selectors/collectionsStructure';
import {formDocsEndpointDL} from 'ui/utils/docs';

import DialogManager from '../../DialogManager/DialogManager';
import {EntriesNotificationCut} from '../components/EntriesNotificationCut/EntriesNotificationCut';
import {useNotificationsAndDetails} from '../hooks/useNotificationsAndDetails';
import type {ImportExportStatus} from '../types';

import {ExportInfo} from './ExportInfo/ExportInfo';
import {downloadObjectAsJSON} from './utils';

import './ExportWorkbookDialog.scss';

const b = block('export-workbook-file-dialog');

const i18n = I18n.keyset('component.workbook-export-dialog.view');
const notificationsI18n = I18n.keyset('component.workbook-export.notifications');

const GET_EXPORT_PROGRESS_INTERVAL = 1000;

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

export const ExportWorkbookDialog: React.FC<Props> = ({
    workbookId,
    workbookTitle,
    open,
    onClose,
}) => {
    const dispatch: AppDispatch = useDispatch();

    const [view, setView] = React.useState<DialogView>('info');
    const status = useSelector(selectExportWorkbookStatus);

    const dialogRef = React.useRef<HTMLDivElement>(null);

    const error = useSelector(selectExportError);
    const isResultLoading = useSelector(selectGetExportResultLoading);
    const exportData = useSelector(selectExportData);
    const progressData = useSelector(selectGetExportProgressData);
    const notificationEntriesMap = useSelector(selectGetExportProgressEntriesMap);
    const progress = progressData?.progress;
    const notifications = progressData?.notifications;

    const exportProgressTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const isMounted = React.useCallback(() => true, []);

    const {notificationDetails, preparedNotifications, handleShowDetails} =
        useNotificationsAndDetails({
            notifications,
            exportId: exportData?.exportId,
        });

    const isExportLoading = status === 'loading' || status === 'pending';
    const isButtonLoading = isExportLoading || isResultLoading;

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
        if (isExportLoading && exportData?.exportId) {
            dispatch(
                openDialog({
                    id: DIALOG_DEFAULT,
                    props: {
                        open: true,
                        onApply: () => {
                            dispatch(cancelExportProcess(exportData.exportId)).then(() => {
                                dispatch(closeDialog());
                                onClose();
                            });
                        },
                        onCancel: () => {
                            dispatch(closeDialog());
                        },
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

        if (status === 'success' && exportData?.exportId) {
            dispatch(
                openDialog({
                    id: DIALOG_DEFAULT,
                    props: {
                        open: true,
                        onApply: () => {
                            dispatch(closeDialog());
                            onClose();
                        },
                        onCancel: () => {
                            dispatch(closeDialog());
                        },
                        message: i18n('label_close-export-description'),
                        textButtonApply: i18n('button_close-export'),
                        textButtonCancel: i18n('button_back-to-export'),
                        propsButtonApply: {view: 'outlined-danger'},
                        caption: i18n('title_close-export'),
                        className: b('import-cancel-dialog'),
                    },
                }),
            );

            return;
        }

        onClose();
    }, [dispatch, exportData?.exportId, isExportLoading, onClose, status]);

    const startExport = React.useCallback(async () => {
        const exportResult = await dispatch(exportWorkbook({workbookId}));
        if (exportResult && exportResult.exportId) {
            pollExportStatus(exportResult.exportId);
        }
    }, [dispatch, pollExportStatus, workbookId]);

    const getExportFile = React.useCallback(async () => {
        if (exportData?.exportId) {
            const result = await dispatch(getExportResult({exportId: exportData?.exportId}));
            if (result && result.status === 'success') {
                downloadObjectAsJSON({obj: result.data, name: workbookTitle, dialogRef});
                onClose();
            }
        }
    }, [dispatch, exportData?.exportId, onClose, workbookTitle]);

    const handleApply = React.useCallback(async () => {
        if (view === 'info') {
            setView('export');
            startExport();
            return;
        }

        if (status === 'success') {
            getExportFile();
        }
    }, [getExportFile, startExport, status, view]);

    const cancelButtonText =
        view === 'info' || isExportLoading ? i18n('button_cancel') : i18n('button_close');

    const docsUrl = formDocsEndpointDL('/workbooks-collections/export-import-notifications');

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
                if (!preparedNotifications.length && status === 'success') {
                    return (
                        <EntriesNotificationCut
                            title={i18n('label_success-export')}
                            level="success"
                        />
                    );
                }
                return (
                    <React.Fragment>
                        <Flex direction="column" gap={4} className={b('notifications')}>
                            {preparedNotifications.map(({code, message, level, entries}) => (
                                <EntriesNotificationCut
                                    key={code}
                                    title={message}
                                    level={level}
                                    entries={entries}
                                    code={code}
                                    entriesMap={notificationEntriesMap}
                                />
                            ))}
                        </Flex>
                        {docsUrl && (
                            <Link target="_blank" href={docsUrl} className={spacing({mt: 4})}>
                                {notificationsI18n('label_info-documentation-notifications')}
                            </Link>
                        )}
                    </React.Fragment>
                );
            case 'fatal-error':
            default:
                return (
                    <ViewError
                        showDebugInfo={false}
                        containerClassName={b('error-content')}
                        error={error}
                        size="s"
                        exportId={exportData?.exportId}
                    />
                );
        }
    };

    return (
        <Dialog className={b()} open={open} onClose={handleCancel}>
            <Dialog.Header caption={getCaption(view, status)} />
            <Dialog.Body>
                <Flex direction="column" ref={dialogRef}>
                    {renderBody()}
                </Flex>
            </Dialog.Body>
            <Dialog.Footer
                textButtonApply={getApplyButtonText(view, status)}
                textButtonCancel={cancelButtonText}
                onClickButtonApply={handleApply}
                onClickButtonCancel={handleCancel}
                propsButtonApply={{loading: isButtonLoading}}
                propsButtonCancel={{disabled: isResultLoading}}
            >
                {notificationDetails && (
                    <Button size="l" view="outlined" onClick={handleShowDetails}>
                        {notificationsI18n('button_show-details')}
                    </Button>
                )}
            </Dialog.Footer>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_EXPORT_WORKBOOK, ExportWorkbookDialog);
