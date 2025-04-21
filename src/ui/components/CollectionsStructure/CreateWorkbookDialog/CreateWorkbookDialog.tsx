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
    props: CreateWorkbookDialogProps;
};

export type CreateWorkbookDialogProps = {
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

export const CreateWorkbookDialog: React.FC<CreateWorkbookDialogProps> = ({
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
    const {data: importProgressData} = useSelector(selectGetImportProgress);
    const importProgress = importProgressData?.progress;

    const [isExternalLoading, setIsExternalLoading] = React.useState(false);

    const importStatus = useSelector(selectImportWorkbookStatus);

    const isImportLoading = importStatus === 'loading' || importStatus === 'pending';
    const isLoading = isCreatingLoading || isImportLoading || isExternalLoading;

    const [view, setView] = React.useState<'default' | 'import'>(defaultView);
    const [importFiles, setImportFiles] = React.useState<File[]>([]);
    const [importValidationError, setImportValidationError] = React.useState<null | string>(null);

    const importProgressTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const isMounted = useMountedState();

    React.useEffect(() => {
        if (open) {
            dispatch(resetImportWorkbook());
            setView(defaultView);
            setImportFiles([]);
            setImportValidationError(null);
        }
    }, [defaultView, dispatch, open]);

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
    }, [importData?.importId, pollImportStatus, importId]);

    const handleFileUploding = (file: File) => {
        setImportFiles([file]);
        setImportValidationError(null);
    };

    const handleRemoveFile = (index: number) => {
        setImportFiles((prev) => prev.filter((_, i) => i !== index));
        setImportValidationError(null);
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

            let result: CreateWorkbookResponse | null = null;
            const workbookData = {
                title,
                description: description ?? '',
                collectionId,
            };

            if (isEnabledFeature(Feature.EnableExportWorkbookFile) && importFiles.length > 0) {
                setView('import');
                const importResult = await dispatch(importWorkbook(workbookData));
                if (importResult && importResult.importId) {
                    pollImportStatus(importResult.importId);
                }
                return;
            } else {
                result = await dispatch(createWorkbook(workbookData));
            }

            // TODO: add importProgressData type in onApply type func
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
        [collectionId, dispatch, importFiles, importStatus, onApply, pollImportStatus],
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
                    disabled: isLoading && !isImportLoading,
                },
                textButtonCancel: importStatus
                    ? getCancelButtonText(importStatus, textButtonCancel)
                    : textButtonCancel,
            };
        },
        [handleClose, importStatus, isImportLoading, isLoading],
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
                    error={importError}
                    data={importProgressData}
                    status={importStatus}
                    progress={importProgress ?? 0}
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
