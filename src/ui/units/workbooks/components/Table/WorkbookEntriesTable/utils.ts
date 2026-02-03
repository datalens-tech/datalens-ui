import {EntryScope, WorkbookPageQa} from 'shared';
import type {WorkbookPermission} from 'shared/schema';
import type {GetWorkbookEntryUrl} from 'ui/registry/units/workbooks/types/functions/getWorkbookEntryUrl';
import {getIsRestrictedSharedEntry} from 'ui/utils';

import navigateHelper from '../../../../../libs/navigateHelper';
import type {EntryChunkItem, WorkbookUnionEntry} from '../../../types';

export const getWorkbookEntryForExtractUrl = (workbookEntry: WorkbookUnionEntry) => {
    const isRestricted = getIsRestrictedSharedEntry(workbookEntry);
    const {scope, entryId, type} = workbookEntry;
    const key = isRestricted ? '' : workbookEntry.key;
    return {scope, entryId, type, key};
};

export const getWorkbookEntryUrl: GetWorkbookEntryUrl = ({workbookEntry, workbook}) => {
    if (
        workbookEntry.scope === EntryScope.Widget &&
        !workbook.permissions.view &&
        workbook.permissions.limitedView
    ) {
        return `/preview/${workbookEntry.entryId}`;
    }
    const entry = getWorkbookEntryForExtractUrl(workbookEntry);

    return new URL(navigateHelper.redirectUrlSwitcher(entry), window.location.origin).pathname;
};

export const getIsCanShowContextMenu = <T extends WorkbookUnionEntry>(
    entry: T,
    workbookPermissions: WorkbookPermission,
) => {
    if (entry.collectionId) {
        return workbookPermissions.updateAccessBindings;
    } else {
        return workbookPermissions.update;
    }
};

export const getIsCanUpdateSharedEntryBindings = <T extends WorkbookUnionEntry>(entry: T) => {
    return (
        entry.fullPermissions?.createEntryBinding ||
        entry.fullPermissions?.createLimitedEntryBinding ||
        undefined
    );
};

export const getChunkScopeQa = <T extends WorkbookUnionEntry>(item: EntryChunkItem<T>) => {
    if (item.item.collectionId) {
        return `${WorkbookPageQa.ChunkSharedEntryScope}${item.item.scope}`;
    } else {
        return `${WorkbookPageQa.ChunkScope}${item.item.scope}`;
    }
};
