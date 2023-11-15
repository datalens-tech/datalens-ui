import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ConnectorType} from 'shared';
import {ErrorContent} from 'ui/index';

import type {AppDispatch} from '../../store';
import {closeDialog, openDialog} from '../../store/actions/dialog';
import {
    getEntry,
    getRelationsGraph,
    migrateEntriesToWorkbookByCopy,
    migrateEntriesToWorkbookByTransfer,
    resetState,
} from '../../store/actions/migrationToWorkbook';
import {
    selectIsLoadingRelationsGraph,
    selectIsLoadingTargetEntry,
    selectRelationsGraph,
    selectRelationsGraphError,
    selectTargetEntry,
    selectTargetEntryError,
} from '../../store/selectors/migrationToWorkbook';
import {DIALOG_MIGRATE_ENTRY_TO_WORKBOOK} from '../CollectionsStructure';
import DialogManager from '../DialogManager/DialogManager';
import {SmartLoader} from '../SmartLoader/SmartLoader';

import {Body} from './components/Body';

import './MigrateToWorkbookDialog.scss';

const b = block('dl-migrate-to-workbook-dialog');

const i18n = I18n.keyset('component.migrate-to-workbook-dialog');

export type Props = {
    open: boolean;
    entryId: string;
    onSuccess: () => void;
    onClose: () => void;
    isTransferToWorkbook?: boolean;
};

export const DIALOG_MIGRATE_TO_WORKBOOK = Symbol('DIALOG_MIGRATE_TO_WORKBOOK');

export type OpenDialogTransferToWorkbookArgs = {
    id: typeof DIALOG_MIGRATE_TO_WORKBOOK;
    props: Props;
};

export const MigrateToWorkbookDialog: React.FC<Props> = ({
    open,
    entryId,
    onClose,
    onSuccess,
    isTransferToWorkbook,
}) => {
    const [isLoadingInited, setIsLoadingInited] = React.useState(false);

    const dispatch: AppDispatch = useDispatch();

    const isLoadingTargetEntry = useSelector(selectIsLoadingTargetEntry);
    const isLoadingRelationsGraph = useSelector(selectIsLoadingRelationsGraph);

    const targetEntry = useSelector(selectTargetEntry);

    const relationsGraph = useSelector(selectRelationsGraph);

    const isLoading = isLoadingTargetEntry || isLoadingRelationsGraph;

    const targetEntryError = useSelector(selectTargetEntryError);
    const relationsGraphError = useSelector(selectRelationsGraphError);
    const requestError = targetEntryError || relationsGraphError;

    const isError = !isLoading && requestError !== null;

    const disableCopy = Boolean(
        !isTransferToWorkbook &&
            relationsGraph?.find(
                (entry) =>
                    entry.type === ConnectorType.Csv ||
                    entry.type === ConnectorType.GsheetsV2 ||
                    entry.type === ConnectorType.Gsheets,
            ),
    );

    React.useEffect(() => {
        const promises: CancellablePromise<unknown>[] = [];

        if (open) {
            dispatch(resetState());
            setIsLoadingInited(true);

            promises.push(dispatch(getEntry({entryId})));
            promises.push(dispatch(getRelationsGraph({entryId})));
        }

        return () => {
            promises.forEach((promise) => {
                promise.cancel();
            });
        };
    }, [open, entryId, dispatch]);

    const handleButtonApply = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_MIGRATE_ENTRY_TO_WORKBOOK,
                props: {
                    open: true,
                    onApply: async (workbookId) => {
                        if (targetEntry && relationsGraph) {
                            const params = {
                                workbookId,
                                entryIds: [
                                    targetEntry.entryId,
                                    ...relationsGraph.map((item) => item.entryId),
                                ],
                            };
                            const response = await dispatch(
                                isTransferToWorkbook
                                    ? migrateEntriesToWorkbookByTransfer(params)
                                    : migrateEntriesToWorkbookByCopy(params),
                            );

                            if (response) {
                                onSuccess();
                                location.href = `/workbooks/${workbookId}?tab=all&dialog=access`;
                            }
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                        onClose();
                    },
                },
            }),
        );
    }, [dispatch, isTransferToWorkbook, onClose, onSuccess, relationsGraph, targetEntry]);

    const handleGoBack = () => {
        dispatch(closeDialog());
    };

    if (!isLoadingInited) {
        return null;
    }

    return (
        <Dialog open={open} onClose={onClose} size="m">
            <div className={b()}>
                <Dialog.Header
                    caption={isTransferToWorkbook ? i18n('title_transfer') : i18n('title_copy')}
                />
                <Dialog.Body className={b('body')}>
                    {isLoading ? (
                        <SmartLoader size="m" showAfter={0} />
                    ) : (
                        <React.Fragment>
                            {isError || targetEntry === null || relationsGraph === null ? (
                                <ErrorContent
                                    className={b('error-block')}
                                    error={requestError}
                                    description={
                                        <div className={b('error')}>
                                            {requestError?.message || i18n('label_unknown-error')}
                                        </div>
                                    }
                                />
                            ) : (
                                <Body
                                    isTransferToWorkbook={isTransferToWorkbook}
                                    targetEntry={targetEntry}
                                    relationsGraph={relationsGraph}
                                    disableCopy={disableCopy}
                                    handleGoBack={handleGoBack}
                                />
                            )}
                        </React.Fragment>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_next')}
                    propsButtonApply={{
                        disabled: isLoading || isError || disableCopy,
                    }}
                    textButtonCancel={i18n('action_cancel')}
                    onClickButtonApply={handleButtonApply}
                    onClickButtonCancel={onClose}
                />
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_MIGRATE_TO_WORKBOOK, MigrateToWorkbookDialog);
