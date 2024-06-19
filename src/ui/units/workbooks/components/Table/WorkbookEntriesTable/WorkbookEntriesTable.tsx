import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {EntryScope} from 'shared';
import {getUserId} from 'shared/modules/user';
import {DIALOG_COPY_ENTRIES_TO_WORKBOOK} from 'ui/components/CopyEntriesToWorkbookDialog';
import {EntryDialogName, EntryDialogues} from 'ui/components/EntryDialogues';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {getResolveUsersByIdsAction} from 'ui/store/actions/usersByIds';
import {CreateEntryActionType} from 'ui/units/workbooks/constants';
import {isMobileView} from 'ui/utils/mobile';

import type {GetEntryResponse} from '../../../../../../shared/schema';
import type {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import type {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import type {ChunkItem, WorkbookEntry} from '../../../types';
import {CreateEntry} from '../../CreateEntry/CreateEntry';
import {DIALOG_DELETE_ENTRY_IN_NEW_WORKBOOK} from '../../DeleteEntryDialog/DeleteEntryDialog';
import {DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK} from '../../DuplicateEntryDialog/DuplicateEntryDialog';
import {DIALOG_RENAME_ENTRY_IN_NEW_WORKBOOK} from '../../RenameEntryDialog/RenameEntryDialog';

import {ChunkGroup} from './ChunkGroup/ChunkGroup';
import {MainTabContent} from './MainTabContent/MainTabContent';
import {defaultRowStyle} from './constants';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

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

        const [dashChunk = [], connChunk = [], datasetChunk = [], widgetChunk = []] = chunks;

        const isWidgetEmpty = widgetChunk.length === 0;
        const isDashEmpty = dashChunk.length === 0;

        const clearViewDash = isMobileView && isWidgetEmpty;
        const clearViewWidget = isMobileView && isDashEmpty;

        const showDataEntities = workbook.permissions.view && !isMobileView;

        const renderTabs = () => {
            if (scope) {
                return null;
            }

            if (isMobileView && isWidgetEmpty && isDashEmpty) {
                return (
                    <PlaceholderIllustration
                        name="template"
                        title={i18n('label_empty-mobile-workbook')}
                    />
                );
            }

            return (
                <React.Fragment>
                    <MainTabContent
                        chunk={dashChunk}
                        actionCreateText={i18n('action_create-dashboard')}
                        title={i18n('title_dashboards')}
                        actionType={CreateEntryActionType.Dashboard}
                        isShowMoreBtn={Boolean(!isDashEmpty && mapTokens?.[EntryScope.Dash])}
                        loadMoreEntries={() => loadMoreEntries?.(EntryScope.Dash)}
                        retryLoadEntries={() => retryLoadEntries?.(EntryScope.Dash)}
                        isErrorMessage={mapErrors?.[EntryScope.Dash]}
                        isLoading={mapLoaders?.[EntryScope.Dash]}
                        workbook={workbook}
                        onRenameEntry={onRenameEntry}
                        onDeleteEntry={onDeleteEntry}
                        onDuplicateEntry={onDuplicateEntry}
                        onCopyEntry={onCopyEntry}
                        clearView={clearViewDash}
                        onShowRelatedClick={onShowRelated}
                    />

                    <MainTabContent
                        chunk={widgetChunk}
                        actionCreateText={i18n('action_create-chart')}
                        title={i18n('title_charts')}
                        actionType={CreateEntryActionType.Wizard}
                        isShowMoreBtn={Boolean(!isWidgetEmpty && mapTokens?.[EntryScope.Widget])}
                        loadMoreEntries={() => loadMoreEntries?.(EntryScope.Widget)}
                        retryLoadEntries={() => retryLoadEntries?.(EntryScope.Widget)}
                        isErrorMessage={mapErrors?.[EntryScope.Widget]}
                        isLoading={mapLoaders?.[EntryScope.Widget]}
                        workbook={workbook}
                        onRenameEntry={onRenameEntry}
                        onDeleteEntry={onDeleteEntry}
                        onDuplicateEntry={onDuplicateEntry}
                        onCopyEntry={onCopyEntry}
                        createEntryBtn={
                            <CreateEntry className={b('controls')} scope={EntryScope.Widget} />
                        }
                        clearView={clearViewWidget}
                        onShowRelatedClick={onShowRelated}
                    />

                    {showDataEntities && (
                        <MainTabContent
                            chunk={datasetChunk}
                            actionCreateText={i18n('action_create-dataset')}
                            title={i18n('title_datasets')}
                            actionType={CreateEntryActionType.Dataset}
                            isShowMoreBtn={Boolean(
                                datasetChunk?.length > 0 && mapTokens?.[EntryScope.Dataset],
                            )}
                            loadMoreEntries={() => loadMoreEntries?.(EntryScope.Dataset)}
                            retryLoadEntries={() => retryLoadEntries?.(EntryScope.Dataset)}
                            isErrorMessage={mapErrors?.[EntryScope.Dataset]}
                            isLoading={mapLoaders?.[EntryScope.Dataset]}
                            workbook={workbook}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                            onShowRelatedClick={onShowRelated}
                        />
                    )}

                    {showDataEntities && (
                        <MainTabContent
                            chunk={connChunk}
                            actionCreateText={i18n('action_create-connection')}
                            title={i18n('title_connections')}
                            actionType={CreateEntryActionType.Connection}
                            isShowMoreBtn={Boolean(
                                connChunk?.length > 0 && mapTokens?.[EntryScope.Connection],
                            )}
                            loadMoreEntries={() => loadMoreEntries?.(EntryScope.Connection)}
                            retryLoadEntries={() => retryLoadEntries?.(EntryScope.Connection)}
                            isErrorMessage={mapErrors?.[EntryScope.Connection]}
                            isLoading={mapLoaders?.[EntryScope.Connection]}
                            workbook={workbook}
                            onRenameEntry={onRenameEntry}
                            onDeleteEntry={onDeleteEntry}
                            onDuplicateEntry={onDuplicateEntry}
                            onCopyEntry={onCopyEntry}
                            onShowRelatedClick={onShowRelated}
                        />
                    )}
                </React.Fragment>
            );
        };

        return (
            <React.Fragment>
                <div className={b()}>
                    <div className={b('table')}>
                        {!isMobileView && (
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
                                />
                            ))}
                    </div>
                </div>
                {renderTabs()}
                <EntryDialogues ref={entryDialoguesRef} />
            </React.Fragment>
        );
    },
);

WorkbookEntriesTable.displayName = 'WorkbookEntriesTable';
