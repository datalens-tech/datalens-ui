import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorContent} from 'ui/index';

import type {AppDispatch} from '../../store';
import {closeDialog, openDialog} from '../../store/actions/dialog';
import {
    getEntry,
    getRelationsGraph,
    migrateCopiedEntriesToWorkbook,
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

import {MigrationBody} from './MigrationBody/MigrationBody';
import {migrateByCopy, migrateByTransfer} from './constants';

// import {Body} from './components/Body';

import './MigrateToWorkbookDialog.scss';

const b = block('dl-migrate-to-workbook-dialog');

const i18n = I18n.keyset('component.migrate-to-workbook-dialog');

export type Props = {
    open: boolean;
    entryId: string;
    onSuccess: () => void;
    onClose: () => void;
};

export const DIALOG_MIGRATE_TO_WORKBOOK = Symbol('DIALOG_MIGRATE_TO_WORKBOOK');

export type OpenDialogMigrateToWorkbookArgs = {
    id: typeof DIALOG_MIGRATE_TO_WORKBOOK;
    props: Props;
};

export const MigrateToWorkbookDialog: React.FC<Props> = ({open, entryId, onClose, onSuccess}) => {
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
                            await dispatch(
                                migrateCopiedEntriesToWorkbook({
                                    workbookId,
                                    entryIds: [
                                        targetEntry.entryId,
                                        ...relationsGraph.map((item) => item.entryId),
                                    ],
                                }),
                            ).then((response) => {
                                if (response && response.length > 0) {
                                    onSuccess();
                                    location.href = `/workbooks/${workbookId}?tab=all&dialog=access`;
                                }
                            });
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [dispatch, onSuccess, relationsGraph, targetEntry]);

    if (!isLoadingInited) {
        return null;
    }

    return (
        <Dialog open={true} onClose={onClose} size="l">
            <div className={b()}>
                <Dialog.Header caption={i18n('title')} />
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
                                // <Body targetEntry={targetEntry} relationsGraph={relationsGraph} />
                                <div className={b('body-content')}>
                                    <div className={b('block-content-item')}>
                                        <MigrationBody content={migrateByCopy} />
                                    </div>
                                    <div className={b('block-content-item')}>
                                        <MigrationBody content={migrateByTransfer} />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_move')}
                    propsButtonApply={{
                        disabled: isLoading || isError,
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
