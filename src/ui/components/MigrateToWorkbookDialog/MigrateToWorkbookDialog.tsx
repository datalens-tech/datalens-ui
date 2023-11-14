import React from 'react';

import {CancellablePromise} from '@gravity-ui/sdk';
import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorContent} from 'ui/index';

import type {AppDispatch} from '../../store';
import {closeDialog, openDialog} from '../../store/actions/dialog';
import {getEntry, getRelationsGraph, resetState} from '../../store/actions/migrationToWorkbook';
import {
    selectIsLoadingRelationsGraph,
    selectIsLoadingTargetEntry,
    selectRelationsGraph,
    selectRelationsGraphError,
    selectTargetEntry,
    selectTargetEntryError,
} from '../../store/selectors/migrationToWorkbook';
import DialogManager from '../DialogManager/DialogManager';
import {SmartLoader} from '../SmartLoader/SmartLoader';

import {MigrationBody} from './MigrationBody/MigrationBody';
import {DIALOG_TRANSFER_TO_WORKBOOK} from './TransferToWorkbookDialog/TransferToWorkbookDialog';
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

enum Migration {
    Copy = 'copy',
    Transfer = 'transfer',
}

export const DIALOG_MIGRATE_TO_WORKBOOK = Symbol('DIALOG_MIGRATE_TO_WORKBOOK');

export type OpenDialogMigrateToWorkbookArgs = {
    id: typeof DIALOG_MIGRATE_TO_WORKBOOK;
    props: Props;
};

export const MigrateToWorkbookDialog: React.FC<Props> = ({open, entryId, onClose, onSuccess}) => {
    const [isLoadingInited, setIsLoadingInited] = React.useState(false);
    const [selectedMigration, setSelectedMigration] = React.useState<Migration | null>(null);

    const isTransferToWorkbook = selectedMigration === Migration.Transfer;
    const isCopyToWorkbook = selectedMigration === Migration.Copy;

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
                id: DIALOG_TRANSFER_TO_WORKBOOK,
                props: {
                    open: true,
                    entryId,
                    onSuccess,
                    isTransferToWorkbook,
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [dispatch, entryId, isTransferToWorkbook, onSuccess]);

    if (!isLoadingInited) {
        return null;
    }

    const handleSelectMigration = (migration: Migration) => {
        setSelectedMigration(migration);
    };

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
                                    <div
                                        className={b('block-content-item')}
                                        onClick={() => handleSelectMigration(Migration.Copy)}
                                    >
                                        <MigrationBody
                                            isActive={isCopyToWorkbook}
                                            content={migrateByCopy}
                                        />
                                    </div>
                                    <div
                                        className={b('block-content-item')}
                                        onClick={() => handleSelectMigration(Migration.Transfer)}
                                    >
                                        <MigrationBody
                                            isActive={isTransferToWorkbook}
                                            content={migrateByTransfer}
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    )}
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_сhoose')}
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
