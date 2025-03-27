import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {EntryScope} from 'shared';
import {PlaceholderIllustration} from 'ui/components/PlaceholderIllustration/PlaceholderIllustration';
import {DL} from 'ui/constants/common';
import {CreateEntryActionType} from 'ui/units/workbooks/constants';

import type {WorkbookWithPermissions} from '../../../../../../shared/schema/us/types';
import type {ChunkItem, WorkbookEntry} from '../../../types';
import {CreateEntry} from '../../CreateEntry/CreateEntry';

import {MainTabContent} from './MainTabContent/MainTabContent';

import './WorkbookEntriesTable.scss';

const i18n = I18n.keyset('new-workbooks');

const b = block('dl-workbook-entries-table');

export type WorkbookEntriesTableTabsProps = {
    workbook: WorkbookWithPermissions;
    loadMoreEntries?: (entryScope: EntryScope) => void;
    retryLoadEntries?: (entryScope: EntryScope) => void;
    scope?: EntryScope;
    mapTokens?: Record<string, string>;
    mapErrors?: Record<string, boolean>;
    mapLoaders?: Record<string, boolean>;
    chunks: ChunkItem[][];
    availableScopes?: EntryScope[];
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
    onShowRelated: (data: WorkbookEntry) => void;
    onCopyId?: (data: WorkbookEntry) => void;
};

export const WorkbookEntriesTableTabs = ({
    workbook,
    retryLoadEntries,
    loadMoreEntries,
    scope,
    mapTokens,
    mapErrors,
    mapLoaders,
    chunks,
    onRenameEntry,
    onDeleteEntry,
    onDuplicateEntry,
    onCopyEntry,
    onShowRelated,
    onCopyId,
}: WorkbookEntriesTableTabsProps) => {
    if (scope) {
        return null;
    }

    const [dashChunk = [], widgetChunk = [], datasetChunk = [], connChunk = []] = chunks;

    const isWidgetEmpty = widgetChunk.length === 0;
    const isDashEmpty = dashChunk.length === 0;

    const clearViewDash = DL.IS_MOBILE && isWidgetEmpty;
    const clearViewWidget = DL.IS_MOBILE && isDashEmpty;

    const showDataEntities = workbook.permissions.view && !DL.IS_MOBILE;

    if (DL.IS_MOBILE && isWidgetEmpty && isDashEmpty) {
        return (
            <PlaceholderIllustration name="template" title={i18n('label_empty-mobile-workbook')} />
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
                onCopyId={onCopyId}
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
                createEntryBtn={<CreateEntry className={b('controls')} scope={EntryScope.Widget} />}
                clearView={clearViewWidget}
                onShowRelatedClick={onShowRelated}
                onCopyId={onCopyId}
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
                    onCopyId={onCopyId}
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
                    onCopyId={onCopyId}
                />
            )}
        </React.Fragment>
    );
};
