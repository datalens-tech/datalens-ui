import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared/types/feature';
import type {AppDispatch} from 'store';
import {DIALOG_DEFAULT} from 'ui/components/DialogDefault/DialogDefault';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {CreateWorkbookResponse} from '../../../../shared/schema';
import {
    createWorkbook,
    importWorkbook,
    resetImportWorkbook,
} from '../../../store/actions/collectionsStructure';
import {
    selectCreateWorkbookIsLoading,
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
};

const b = block('create-workbook-dialog');

export const CreateWorkbookDialog: React.FC<Props> = ({
    collectionId,
    open,
    dialogTitle,
    defaultWorkbookTitle,
    onClose,
    onApply,
}) => {
    const dispatch: AppDispatch = useDispatch();

    const isCreatingLoading = useSelector(selectCreateWorkbookIsLoading);

    const {
        isLoading: isImportLoading,
        error: importError,
        // TODO: data is needed to render succes phase
        data: _,
    } = useSelector(selectImportWorkbook);

    const [isExternalLoading, setIsExternalLoading] = React.useState(false);

    const isLoading = isCreatingLoading || isImportLoading || isExternalLoading;

    const [view, setView] = React.useState<'default' | 'import'>('default');
    const [importFiles, setImportFiles] = React.useState<File[]>([]);
    const [hasImportError, setHasImportError] = React.useState(false);

    const importStatus = useSelector(selectImportWorkbookStatus);

    React.useEffect(() => {
        if (open) {
            setView('default');
            setImportFiles([]);
            setHasImportError(false);
            dispatch(resetImportWorkbook());
        }
    }, [dispatch, open]);

    const handleFileUploding = (file: File) => {
        setImportFiles([file]);
        setHasImportError(false);
    };

    const handleRemoveFile = (index: number) => {
        setImportFiles((prev) => prev.filter((_, i) => i !== index));
        setHasImportError(false);
    };

    const handleClose = React.useCallback(() => {
        if (isImportLoading) {
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
    }, [dispatch, isImportLoading, onClose]);

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
            if (importFiles.length > 0 && !importFiles[0].name.toLowerCase().endsWith('.json')) {
                setHasImportError(true);
                return;
            }

            let result: CreateWorkbookResponse | null;
            const workbookData = {
                title,
                description: description ?? '',
                collectionId,
            };

            if (isEnabledFeature(Feature.EnableExportWorkbookFile) && importFiles.length > 0) {
                result = await dispatch(importWorkbook(workbookData));

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
        [collectionId, dispatch, importFiles, onApply],
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
                    view: importStatus === 'error' ? 'normal' : 'flat',
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
                hasError={hasImportError}
            />
        );
    };

    const renderDialogView = () => {
        if (view === 'import') {
            return <ImportWorkbookView status={importStatus} error={importError} />;
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
