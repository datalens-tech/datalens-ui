import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
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
    selectGetImportProgress,
    selectImportWorkbook,
    selectImportWorkbookStatus,
} from '../../../store/selectors/collectionsStructure';
import DialogManager from '../../DialogManager/DialogManager';
import type {GetDialogFooterPropsOverride} from '../WorkbookDialog';
import {WorkbookDialog} from '../WorkbookDialog';

import {ImportFileField} from './ImportFileField/ImportFileField';
import {ImportWorkbookView} from './ImportWorkbookView/ImportWorkbookView';
import {getApplyButtonText, getCancelButtonText, getCaption} from './utils';

import './CreateWorkbookDialog.scss';

const i18n = I18n.keyset('component.collections-structure');

const GET_IMPORT_PROGRESS_INTERVAL = 1000;

export const DIALOG_CREATE_WORKBOOK = Symbol('DIALOG_CREATE_WORKBOOK');

export type OpenDialogCreateWorkbookArgs = {
    id: typeof DIALOG_CREATE_WORKBOOK;
    props: Props;
};

type Props = {
    collectionId: string | null;
    open: boolean;
    dialogTitle?: string;
    defaultWorkbookTitle?: string;
    onClose: () => void;
    onApply?: (result: CreateWorkbookResponse | null) => void | Promise<void>;
    defaultView?: 'default' | 'import';
    importId?: string;
};

const b = block('create-workbook-dialog');

export const CreateWorkbookDialog: React.FC<Props> = ({
    collectionId,
    open,
    dialogTitle,
    defaultWorkbookTitle,
    onClose,
    onApply,
    defaultView = 'default',
    importId,
}) => {
    const dispatch: AppDispatch = useDispatch();

    const isCreatingLoading = useSelector(selectCreateWorkbookIsLoading);

    const {error: importError, data: importData} = useSelector(selectImportWorkbook);
    const {data: importProgress} = useSelector(selectGetImportProgress);

    const [isExternalLoading, setIsExternalLoading] = React.useState(false);

    const importStatus = useSelector(selectImportWorkbookStatus);

    const isLoading = isCreatingLoading || importStatus === 'loading' || isExternalLoading;

    const [view, setView] = React.useState<'default' | 'import'>(defaultView);
    const [importFiles, setImportFiles] = React.useState<File[]>([]);
    const [importValidationError, setImportValidationError] = React.useState<null | string>(null);

    const isMounted = useMountedState();

    React.useEffect(() => {
        if (open) {
            setView(defaultView);
            setImportFiles([]);
            setImportValidationError(null);
            dispatch(resetImportWorkbook());
        }
    }, [defaultView, dispatch, open]);

    React.useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isCancelled = false;

        const fetchProgress = async () => {
            if (!isMounted() || isCancelled) {
                return;
            }

            const startTime = Date.now();

            await dispatch(getImportProgress({importId}));

            // Calculate time elapsed since request started
            const elapsedTime = Date.now() - startTime;

            // Schedule next poll either after 1 second from the start of the previous request
            // or immediately if the request took longer than 1 second
            if (!isCancelled) {
                const nextPollDelay = Math.max(0, GET_IMPORT_PROGRESS_INTERVAL - elapsedTime);
                timeoutId = setTimeout(fetchProgress, nextPollDelay);
            }
        };

        if (view === 'import' && importStatus === 'loading' && open) {
            fetchProgress();
        }

        return () => {
            isCancelled = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [dispatch, importId, importStatus, isMounted, open, view]);

    const handleFileUploding = (file: File) => {
        setImportFiles([file]);
        setImportValidationError(null);
    };

    const handleRemoveFile = (index: number) => {
        setImportFiles((prev) => prev.filter((_, i) => i !== index));
        setImportValidationError(null);
    };

    const handleClose = React.useCallback(() => {
        if (importStatus === 'loading') {
            dispatch(
                openDialog({
                    id: DIALOG_DEFAULT,
                    props: {
                        open: true,
                        onApply: () => {
                            dispatch(closeDialog());
                            onClose();
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

        onClose();
    }, [dispatch, importStatus, onClose]);

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
            if (importStatus === 'success') {
                // TODO: Add switching to workbook page
                onClose();
            }
            if (importFiles.length > 0 && !importFiles[0].name.toLowerCase().endsWith('.json')) {
                setImportValidationError(i18n('label_error-file-type'));
                return;
            }

            let result: CreateWorkbookResponse | null;
            const workbookData = {
                title,
                description: description ?? '',
                collectionId,
            };

            if (isEnabledFeature(Feature.EnableExportWorkbookFile) && importFiles.length > 0) {
                dispatch(importWorkbook(workbookData));

                setView('import');
                return;
            } else {
                result = await dispatch(createWorkbook(workbookData));
            }

            // TODO: add importData type in onApply type func
            if (onApply) {
                const promise = onApply(result);
                if (promise) {
                    setIsExternalLoading(true);
                    await promise;
                    setIsExternalLoading(false);
                }
            }

            onClose();
        },
        [collectionId, dispatch, importFiles, importStatus, onApply],
    );

    const getDialogFooterPropsOverride = React.useCallback<GetDialogFooterPropsOverride>(
        ({propsButtonApply, onClickButtonApply, textButtonCancel, textButtonApply}) => {
            return {
                onClickButtonCancel: handleClose,
                onClickButtonApply: onClickButtonApply,
                textButtonApply: importStatus
                    ? getApplyButtonText(importStatus, textButtonApply)
                    : textButtonApply,
                propsButtonApply: {disabled: propsButtonApply?.disabled, loading: isLoading},
                propsButtonCancel: {
                    view: importStatus?.endsWith('error') ? 'normal' : 'flat',
                    disabled: isLoading && importStatus !== 'loading',
                },
                textButtonCancel: importStatus
                    ? getCancelButtonText(importStatus, textButtonCancel)
                    : textButtonCancel,
            };
        },
        [handleClose, importStatus, isLoading],
    );

    const renderImportSection = () => {
        if (!isEnabledFeature(Feature.EnableExportWorkbookFile)) {
            return null;
        }
        return (
            <ImportFileField
                onUpload={handleFileUploding}
                onRemove={handleRemoveFile}
                files={importFiles}
                error={importValidationError}
            />
        );
    };

    const renderDialogView = () => {
        if (view === 'import') {
            return (
                <ImportWorkbookView
                    progress={importProgress}
                    status={importStatus}
                    error={importError}
                    data={importData}
                />
            );
        }
        return null;
    };

    const defaultTitle = dialogTitle ?? i18n('action_create-workbook');
    const title = importStatus ? getCaption(importStatus) : defaultTitle;

    return (
        <WorkbookDialog
            title={title}
            textButtonApply={i18n('action_create')}
            open={open}
            isLoading={isLoading}
            titleValue={defaultWorkbookTitle}
            onApply={handleApply}
            onClose={handleClose}
            titleAutoFocus
            customActions={renderImportSection()}
            customBody={renderDialogView()}
            getDialogFooterPropsOverride={getDialogFooterPropsOverride}
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_WORKBOOK, CreateWorkbookDialog);
