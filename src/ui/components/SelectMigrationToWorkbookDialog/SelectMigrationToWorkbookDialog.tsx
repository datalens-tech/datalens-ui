import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';

import type {AppDispatch} from '../../store';
import {closeDialog, openDialog} from '../../store/actions/dialog';
import DialogManager from '../DialogManager/DialogManager';
import {DIALOG_MIGRATE_TO_WORKBOOK} from '../MigrateToWorkbookDialog/MigrateToWorkbookDialog';

import {Body} from './Body/Body';
import {migrateByCopy, migrateByTransfer} from './constants';

import './SelectMigrationToWorkbookDialog.scss';

const b = block('dl-select-migration-to-workbook-dialog ');

const i18n = I18n.keyset('component.select-migration-to-workbook-dialog');

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

export const DIALOG_SELECT_MIGRATION_TO_WORKBOOK = Symbol('DIALOG_SELECT_MIGRATION_TO_WORKBOOK');

export type OpenDialogMigrateToWorkbookArgs = {
    id: typeof DIALOG_SELECT_MIGRATION_TO_WORKBOOK;
    props: Props;
};

export const SelectMigrationToWorkbookDialog: React.FC<Props> = ({
    open,
    entryId,
    onClose,
    onSuccess,
}) => {
    const [selectedMigration, setSelectedMigration] = React.useState<Migration | null>(null);

    const isTransferToWorkbook = selectedMigration === Migration.Transfer;
    const isCopyToWorkbook = selectedMigration === Migration.Copy;

    const dispatch: AppDispatch = useDispatch();

    const handleButtonApply = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_MIGRATE_TO_WORKBOOK,
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

    const handleSelectMigration = (migration: Migration) => {
        setSelectedMigration(migration);
    };

    return (
        <Dialog open={open} onClose={onClose} size="l">
            <div className={b()}>
                <Dialog.Header caption={i18n('title')} />
                <Dialog.Body className={b('body')}>
                    <div className={b('body-content')}>
                        <div
                            className={b('block-content-item')}
                            onClick={() => handleSelectMigration(Migration.Copy)}
                        >
                            <Body isActive={isCopyToWorkbook} content={migrateByCopy} />
                        </div>
                        <div
                            className={b('block-content-item')}
                            onClick={() => handleSelectMigration(Migration.Transfer)}
                        >
                            <Body isActive={isTransferToWorkbook} content={migrateByTransfer} />
                        </div>
                    </div>
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_сhoose')}
                    textButtonCancel={i18n('action_cancel')}
                    onClickButtonApply={handleButtonApply}
                    onClickButtonCancel={onClose}
                />
            </div>
        </Dialog>
    );
};

DialogManager.registerDialog(DIALOG_SELECT_MIGRATION_TO_WORKBOOK, SelectMigrationToWorkbookDialog);
