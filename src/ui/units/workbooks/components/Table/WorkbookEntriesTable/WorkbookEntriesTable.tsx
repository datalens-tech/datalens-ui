import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {EntryScope} from 'shared';
import {DIALOG_COPY_ENTRIES_TO_WORKBOOK} from 'ui/components/CopyEntriesToWorkbookDialog';

import {GetEntryResponse} from '../../../../../../shared/schema';
import {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {WorkbookEntry} from '../../../types';
import {DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK} from '../../DeleteEntryDialog/DeleteEntryDialog';
import {DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK} from '../../DuplicateEntryDialog/DuplicateEntryDialog';
import {DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK} from '../../RenameEntryDialog/RenameEntryDialog';

import {ChunkGroup} from './ChunkGroup/ChunkGroup';
import {MainTabContent} from './MainTabContent/MainTabContent';
import {defaultRowStyle} from './constants';
import {useChunkedEntries} from './useChunkedEntries';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

const b = block('dl-workbook-entries-table');

type WorkbookEntriesTableProps = {
    workbook: WorkbookWithPermissions;
    entries: GetEntryResponse[];
    refreshEntries: () => void;
    scope?: EntryScope;
};

export const WorkbookEntriesTable = React.memo<WorkbookEntriesTableProps>(
    ({workbook, entries, refreshEntries, scope}) => {
        const dispatch: AppDispatch = useDispatch();

        const onRenameEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onDeleteEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK,
                        props: {
                            open: true,
                            data: entity,
                            onClose: () => dispatch(closeDialog()),
                        },
                    }),
                );
            },
            [dispatch],
        );

        const onApplyDuplicate = React.useCallback(() => {
            refreshEntries();
        }, [refreshEntries]);

        const onDuplicateEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            onApply: onApplyDuplicate,
                            initName: entity.name,
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch, onApplyDuplicate],
        );

        const onCopyEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_COPY_ENTRIES_TO_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch],
        );

        const chunks = useChunkedEntries(entries);

        return (
            <div className={b()}>
                <div className={b('table')}>
                    <div className={b('header')}>
                        <div className={b('header-row')} style={defaultRowStyle}>
                            <div className={b('header-cell', {title: true})}>
                                {i18n('label_title')}
                            </div>
                            <div className={b('header-cell')}>{i18n('label_last-modified')}</div>
                            <div className={b('header-cell')} />
                        </div>
                    </div>
                    {scope ? (
                        chunks.map((chunk) => (
                            <ChunkGroup
                                key={chunk[0].key}
                                workbook={workbook}
                                chunk={chunk}
                                onRenameEntry={onRenameEntry}
                                onDeleteEntry={onDeleteEntry}
                                onDuplicateEntry={onDuplicateEntry}
                                onCopyEntry={onCopyEntry}
                                isOpen
                            />
                        ))
                    ) : (
                        <MainTabContent
                            workbook={workbook}
                            chunks={chunks}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                        />
                    )}
                </div>
            </div>
        );
    },
);

WorkbookEntriesTable.displayName = 'WorkbookEntriesTable';
