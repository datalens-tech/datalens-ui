import React from 'react';

import {Button, Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {WorkbookDialogQA} from 'shared/constants/qa';
import {Feature} from 'shared/types/feature';
import type {AppDispatch} from 'store';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {useMountedState} from 'ui/hooks';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {CreateWorkbookResponse} from '../../../../shared/schema';
import {
    createWorkbook,
    getImportProgress,
    importWorkbook,
    resetImportWorkbook,
} from '../../../store/actions/collectionsStructure';
import {
    selectCreateWorkbookIsLoading,
    selectGetImportProgressData,
    selectImportWorkbookData,
    selectImportWorkbookStatus,
} from '../../../store/selectors/collectionsStructure';
import DialogManager from '../../DialogManager/DialogManager';
import type {GetDialogFooterPropsOverride} from '../WorkbookDialog';
import {WorkbookDialog} from '../WorkbookDialog';
import {useNotificationsAndDetails} from '../hooks/useNotificationsAndDetails';
import type {PublicGalleryData} from '../types';

import {ImportFileField} from './ImportFileField/ImportFileField';
import {ImportWorkbookView} from './ImportWorkbookView/ImportWorkbookView';
import {getApplyButtonText, getCancelButtonText, getCaption} from './utils';

import './CreateWorkbookDialog.scss';

const i18n = I18n.keyset('component.collections-structure');
const notificationsI18n = I18n.keyset('component.workbook-export.notifications');

const GET_IMPORT_PROGRESS_INTERVAL = 1000;

export const DIALOG_CREATE_WORKBOOK = Symbol('DIALOG_CREATE_WORKBOOK');

export type OpenDialogCreateWorkbookArgs = {
    id: typeof DIALOG_CREATE_WORKBOOK;
    props: CreateWorkbookDialogProps;
};

export type CreateWorkbookDialogProps = {
    collectionId: string | null;
    open: boolean;
    dialogTitle?: string;
    defaultWorkbookTitle?: string;
    onClose: (isImportBeging?: boolean) => void;
    // TODO: remove and use onCreateWorkbook
    onApply?: (result: {workbookId?: string}) => void | Promise<void>;
    onCreateWorkbook?: ({workbookId}: {workbookId?: string}) => void | Promise<void>;
    defaultView?: 'default' | 'import';
    importId?: string;
    showImport?: boolean;
    publicGallery?: PublicGalleryData;
};

const b = block('create-workbook-dialog');

export const CreateWorkbookDialog: React.FC<CreateWorkbookDialogProps> = ({
    collectionId,
    open,
    dialogTitle,
    defaultWorkbookTitle,
    onClose,
    onCreateWorkbook,
    onApply,
    defaultView = 'default',
    importId,
    showImport,
    publicGallery,
}) => {
    const dispatch: AppDispatch = useDispatch();

    const isCreatingLoading = useSelector(selectCreateWorkbookIsLoading);

    const importStatus = useSelector(selectImportWorkbookStatus);

    const importData = useSelector(selectImportWorkbookData);
    const importProgressData = useSelector(selectGetImportProgressData);
    const notifications = importProgressData?.notifications;

    const currentImportId = importData?.importId || importProgressData?.importId;

    const [isExternalLoading, setIsExternalLoading] = React.useState(false);

    const isImportLoading = importStatus === 'loading' || importStatus === 'pending';
    const isLoading = isCreatingLoading || isImportLoading || isExternalLoading;

    const [view, setView] = React.useState<'default' | 'import'>(defaultView);
    const [importFiles, setImportFiles] = React.useState<File[]>([]);
    const [importValidationError, setImportValidationError] = React.useState<null | string>(null);

    const [publicGalleryState, setPublicGalleryState] = React.useState<PublicGalleryData | null>(
        publicGallery || null,
    );

    const [workbookInitialTitle, setWorkbookInitialTitle] = React.useState<string | undefined>(
        publicGalleryState?.title || defaultWorkbookTitle,
    );

    const importProgressTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const isMounted = useMountedState();

    const {notificationDetails, handleShowDetails} = useNotificationsAndDetails({
        notifications,
        importId: importData?.importId,
    });

    React.useEffect(() => {
        if (open) {
            dispatch(resetImportWorkbook());
            setView(defaultView);
            setImportFiles([]);
            setImportValidationError(null);
        }
    }, [defaultView, dispatch, open]);

    React.useEffect(() => {
        if (importFiles[0] && importFiles[0].name.toLowerCase().endsWith('.json')) {
            setWorkbookInitialTitle(importFiles[0].name.replace(/\.json$/i, ''));
        }
    }, [defaultWorkbookTitle, importFiles, workbookInitialTitle]);

    const pollImportStatus = React.useCallback(
        async (currentImportId: string) => {
            if (importProgressTimeout.current) {
                clearTimeout(importProgressTimeout.current);
            }

            if (!isMounted()) {
                return;
            }

            const startTime = Date.now();

            const result = await dispatch(getImportProgress({importId: currentImportId}));

            const elapsedTime = Date.now() - startTime;

            if (result && result.status === 'pending') {
                const nextPollDelay = Math.max(0, GET_IMPORT_PROGRESS_INTERVAL - elapsedTime);
                importProgressTimeout.current = setTimeout(
                    () => pollImportStatus(currentImportId),
                    nextPollDelay,
                );
            }
        },
        [dispatch, isMounted],
    );

    // open import dialog from importing workbook row
    React.useEffect(() => {
        if (importId) {
            pollImportStatus(importId);
        }
    }, [pollImportStatus, importId]);

    const handleFileUploding = (file: File) => {
        setImportFiles([file]);
        setImportValidationError(null);
        setPublicGalleryState(null);
    };

    const handleRemoveFile = (index: number | 'publicGallery') => {
        if (index === 'publicGallery') {
            setPublicGalleryState(null);
            setWorkbookInitialTitle('');
        } else {
            setImportFiles((prev) => prev.filter((_, i) => i !== index));
            setImportValidationError(null);
        }
    };

    const handleClose = React.useCallback(() => {
        if (importStatus === 'loading' || importStatus === 'pending') {
            dispatch(
                openDialog({
                    id: DIALOG_DEFAULT,
                    props: {
                        open: true,
                        onApply: () => {
                            dispatch(closeDialog());
                            onClose(true);
                        },
                        onCancel: () => dispatch(closeDialog()),
                        message: i18n('label_import-exit-description'),
                        textButtonApply: i18n('action_exit'),
                        textButtonCancel: i18n('action_stay'),
                        caption: i18n('title_import-exit'),
                        className: b('import-cancel-dialog'),
                    },
                }),
            );
            return;
        }

        onClose(importStatus === 'success');
    }, [dispatch, importStatus, onClose]);

    const handleCreateCallback = React.useCallback(
        async (workbookId?: string) => {
            const onCreateCallback = onApply || onCreateWorkbook;
            if (onCreateCallback) {
                const promise = onCreateCallback({workbookId});
                if (promise) {
                    setIsExternalLoading(true);
                    await promise;
                    setIsExternalLoading(false);
                }
            }
        },
        [onApply, onCreateWorkbook],
    );

    const startImport = React.useCallback(
        async (workbookData: {title: string; description: string; collectionId: string | null}) => {
            // include loading of parsing JSON file
            setIsExternalLoading(true);
            const importResult = await dispatch(
                importWorkbook(
                    publicGalleryState
                        ? {...workbookData, publicGalleryUrl: publicGalleryState.data}
                        : {...workbookData, importFile: importFiles[0]},
                ),
            );
            setIsExternalLoading(false);

            if (importResult && importResult.importId) {
                setView('import');
                pollImportStatus(importResult.importId);
            }
        },
        [dispatch, importFiles, pollImportStatus, publicGalleryState],
    );

    const handleApply = React.useCallback(
        async ({
            title,
            description,
            onClose,
        }: {
            title: string;
            description?: string;
            onClose: () => void;
        }) => {
            if (isEnabledFeature(Feature.EnableExportWorkbookFile) && importStatus === 'success') {
                onClose();
                handleCreateCallback(importProgressData?.workbookId);
                return;
            }
            if (
                isEnabledFeature(Feature.EnableExportWorkbookFile) &&
                importFiles.length > 0 &&
                !importFiles[0].name.toLowerCase().endsWith('.json')
            ) {
                setImportValidationError(i18n('label_error-file-type'));
                return;
            }

            const workbookData = {
                title,
                description: description ?? '',
                collectionId,
            };

            if (
                isEnabledFeature(Feature.EnableExportWorkbookFile) &&
                (importFiles.length > 0 || publicGalleryState)
            ) {
                startImport(workbookData);
                return;
            }

            const result: CreateWorkbookResponse | null = await dispatch(
                createWorkbook(workbookData),
            );

            handleCreateCallback(result?.workbookId);

            onClose();
        },
        [
            collectionId,
            dispatch,
            handleCreateCallback,
            importFiles,
            importProgressData?.workbookId,
            importStatus,
            publicGalleryState,
            startImport,
        ],
    );

    const getDialogFooterPropsOverride = React.useCallback<GetDialogFooterPropsOverride>(
        ({
            propsButtonApply,
            onClickButtonApply,
            textButtonCancel,
            textButtonApply,
            qaApplyButton,
        }) => {
            return {
                onClickButtonCancel: handleClose,
                onClickButtonApply: onClickButtonApply,
                textButtonApply: importStatus
                    ? getApplyButtonText(importStatus, textButtonApply)
                    : textButtonApply,
                propsButtonApply: {
                    disabled: currentImportId ? false : propsButtonApply?.disabled,
                    loading: isLoading,
                    qa: qaApplyButton,
                },
                propsButtonCancel: {
                    view: importStatus?.endsWith('error') ? 'normal' : 'flat',
                    disabled: isLoading && !isImportLoading,
                },
                textButtonCancel: importStatus
                    ? getCancelButtonText(importStatus, textButtonCancel)
                    : textButtonCancel,
                children:
                    importStatus && notificationDetails ? (
                        <Button size="l" view="outlined" onClick={handleShowDetails}>
                            {notificationsI18n('button_show-details')}
                        </Button>
                    ) : undefined,
            };
        },

        [
            currentImportId,
            handleClose,
            handleShowDetails,
            importStatus,
            isImportLoading,
            isLoading,
            notificationDetails,
        ],
    );

    const handleRetry = React.useCallback(() => {
        if (importStatus === 'fatal-error' && currentImportId) {
            pollImportStatus(currentImportId);
            return;
        }
    }, [currentImportId, importStatus, pollImportStatus]);

    const renderImportSection = () => {
        if (!isEnabledFeature(Feature.EnableExportWorkbookFile) || !showImport) {
            return null;
        }

        const publicGalleryFile = publicGalleryState?.data?.split('/').pop() || undefined;

        return (
            <ImportFileField
                onUpload={handleFileUploding}
                onRemove={handleRemoveFile}
                files={importFiles}
                error={importValidationError}
                publicGalleryFile={publicGalleryFile}
            />
        );
    };

    const renderDialogView = () => {
        if (view === 'import') {
            const canProgressBeRetried = importStatus === 'fatal-error' && currentImportId;

            const handleRetryFn = canProgressBeRetried ? handleRetry : undefined;
            return (
                <Flex direction="column">
                    <ImportWorkbookView
                        onRetry={handleRetryFn}
                        status={importStatus}
                        importId={currentImportId}
                    />
                </Flex>
            );
        }
        return null;
    };

    const defaultTitle = dialogTitle ?? i18n('action_create-workbook');
    const title = importStatus ? getCaption(importStatus) : defaultTitle;

    return (
        <WorkbookDialog
            title={title}
            titleValue={workbookInitialTitle}
            descriptionValue={publicGalleryState?.description || ''}
            textButtonApply={i18n('action_create')}
            open={open}
            isLoading={isLoading}
            onApply={handleApply}
            onClose={handleClose}
            titleAutoFocus
            customActions={renderImportSection()}
            customBody={renderDialogView()}
            getDialogFooterPropsOverride={getDialogFooterPropsOverride}
            qa={importStatus === 'success' ? WorkbookDialogQA.ROOT_IMPORT_SUCCESS : undefined}
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_WORKBOOK, CreateWorkbookDialog);
