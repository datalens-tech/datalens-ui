import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {EntryScope} from 'shared';
import {getUserId} from 'shared/modules/user';
import {DIALOG_COPY_ENTRIES_TO_WORKBOOK} from 'ui/components/CopyEntriesToWorkbookDialog';
import {EntryDialogName, EntryDialogues} from 'ui/components/EntryDialogues';
import {DL} from 'ui/constants/common';
import {getResolveUsersByIdsAction} from 'ui/store/actions/usersByIds';
import {copyTextWithToast} from 'ui/utils/copyText';

import type {GetEntryResponse} from '../../../../../../shared/schema';
import type {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import {registry} from '../../../../../registry';
import type {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import type {ChunkItem, WorkbookEntry} from '../../../types';
import {DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK} from '../../DeleteEntryDialog/DeleteEntryDialog';
import {DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK} from '../../DuplicateEntryDialog/DuplicateEntryDialog';
import {DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK} from '../../RenameEntryDialog/RenameEntryDialog';

import {ChunkGroup} from './ChunkGroup/ChunkGroup';
import {defaultRowStyle} from './constants';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');
const contextMenuI18n = I18n.keyset('component.entry-context-menu.view');

const b = block('dl-workbook-entries-table');

type WorkbookEntriesTableProps = {
    workbook: WorkbookWithPermissions;
    entries: GetEntryResponse[];
    refreshEntries: (scope: EntryScope) => void;
    loadMoreEntries?: (entryScope: EntryScope) => void;
    retryLoadEntries?: (entryScope: EntryScope) => void;
    scope?: EntryScope;
    mapTokens?: Record<string, string>;
    mapErrors?: Record<string, boolean>;
    mapLoaders?: Record<string, boolean>;
    chunks: ChunkItem[][];
    availableScopes?: EntryScope[];
};

export const WorkbookEntriesTable = React.memo<WorkbookEntriesTableProps>(
    ({
        workbook,
        entries,
        refreshEntries,
        retryLoadEntries,
        loadMoreEntries,
        scope,
        mapTokens,
        mapErrors,
        mapLoaders,
        chunks,
        availableScopes,
    }) => {
        const dispatch: AppDispatch = useDispatch();
        const entryDialoguesRef = React.useRef<EntryDialogues>(null);

        React.useEffect(() => {
            const resolveUsersByIds = getResolveUsersByIdsAction();
            const userIds = new Set<string>();
            entries.forEach((entry) => {
                userIds.add(getUserId(entry.createdBy));
            });

            dispatch(resolveUsersByIds(Array.from(userIds)));
        }, [dispatch, entries]);

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

        const onApplyDuplicate = React.useCallback(
            (entryScope: EntryScope) => {
                refreshEntries(entryScope);
            },
            [refreshEntries],
        );

        const onDuplicateEntry = React.useCallback(
            (entity: WorkbookEntry) => {
                dispatch(
                    openDialog({
                        id: DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK,
                        props: {
                            open: true,
                            onClose: () => dispatch(closeDialog()),
                            onApply: () => onApplyDuplicate(entity.scope as EntryScope),
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
                            initialCollectionId: workbook.collectionId,
                            onClose: () => dispatch(closeDialog()),
                            entryId: entity.entryId,
                        },
                    }),
                );
            },
            [dispatch, workbook.collectionId],
        );

        const onShowRelated = async (entity: WorkbookEntry) => {
            await entryDialoguesRef.current?.open({
                dialog: EntryDialogName.ShowRelatedEntities,
                dialogProps: {
                    entry: entity,
                },
            });
        };

        const onCopyId = (entity: WorkbookEntry) => {
            copyTextWithToast({
                successText: contextMenuI18n('toast_copy-id-success'),
                errorText: contextMenuI18n('toast_copy-error'),
                toastName: 'toast-menu-copy-id',
                copyText: entity.entryId,
            });
        };

        const {WorkbookEntriesTableTabs} = registry.common.components.getAll();

        return (
            <React.Fragment>
                <div className={b()}>
                    <div className={b('table')}>
                        {!DL.IS_MOBILE && (
                            <div className={b('header')} style={defaultRowStyle}>
                                <div className={b('header-cell')}>{i18n('label_title')}</div>
                                <div className={b('header-cell', {author: true})}>
                                    {i18n('label_author')}
                                </div>
                                <div className={b('header-cell', {date: true})}>
                                    {i18n('label_last-modified')}
                                </div>
                                <div className={b('header-cell', {controls: true})} />
                            </div>
                        )}
                        {scope &&
                            chunks.map((chunk) => (
                                <ChunkGroup
                                    key={chunk[0].key}
                                    workbook={workbook}
                                    chunk={chunk}
                                    onRenameEntry={onRenameEntry}
                                    onDeleteEntry={onDeleteEntry}
                                    onDuplicateEntry={onDuplicateEntry}
                                    onCopyEntry={onCopyEntry}
                                    onShowRelatedClick={onShowRelated}
                                    onCopyId={onCopyId}
                                />
                            ))}
                    </div>
                </div>
                <WorkbookEntriesTableTabs
                    workbook={workbook}
                    retryLoadEntries={retryLoadEntries}
                    loadMoreEntries={loadMoreEntries}
                    scope={scope}
                    mapTokens={mapTokens}
                    mapErrors={mapErrors}
                    mapLoaders={mapLoaders}
                    chunks={chunks}
                    availableScopes={availableScopes}
                    onRenameEntry={onRenameEntry}
                    onDeleteEntry={onDeleteEntry}
                    onDuplicateEntry={onDuplicateEntry}
                    onCopyEntry={onCopyEntry}
                    onShowRelated={onShowRelated}
                    onCopyId={onCopyId}
                />
                <EntryDialogues ref={entryDialoguesRef} />
            </React.Fragment>
        );
    },
);

WorkbookEntriesTable.displayName = 'WorkbookEntriesTable';
