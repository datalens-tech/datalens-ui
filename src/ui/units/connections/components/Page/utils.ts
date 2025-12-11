import type {ConnectorType, EntryScope} from 'shared';
import type {SharedEntryPermissions} from 'shared/schema';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';
import type {EntryContextMenuItem} from 'ui/components/EntryContextMenu/helpers';
import {S3_BASED_CONNECTORS} from 'ui/constants';

import {FieldKey} from '../../constants';
import type {ConnectionEntry} from '../../store';
import type {FormDict} from '../../typings';

import {HiddenContextsForSharedEntry, HiddenContextsForWorkbookSharedEntry} from './constants';

export const isS3BasedConnForm = (connectionData: FormDict, paramsType?: string) => {
    const type = (connectionData[FieldKey.DbType] || paramsType) as ConnectorType;
    return S3_BASED_CONNECTORS.includes(type);
};

export const isListPageOpened = (pathname = '') => {
    return /new$/.test(pathname);
};

export const getIsSharedConnection = (
    entry?: ConnectionEntry,
): entry is ConnectionEntry & {
    collectionId: string;
    fullPermissions: SharedEntryPermissions;
    scope: EntryScope.Connection;
} => {
    return Boolean(entry?.collectionId);
};

type FilterMenuItemsProps = {
    items: EntryContextMenuItem[];
    isSharedConnection?: boolean;
    revisionsSupported?: boolean;
    isWorkbookSharedEntry: boolean;
};

export const filterMenuItems = ({
    items,
    isSharedConnection,
    revisionsSupported,
    isWorkbookSharedEntry,
}: FilterMenuItemsProps) => {
    return items.filter((item) => {
        if (isWorkbookSharedEntry && HiddenContextsForWorkbookSharedEntry.has(item.id))
            return false;
        if (isSharedConnection && HiddenContextsForSharedEntry.has(item.id)) return false;
        if (!revisionsSupported && item.id === ENTRY_CONTEXT_MENU_ACTION.REVISIONS) return false;
        return true;
    });
};
