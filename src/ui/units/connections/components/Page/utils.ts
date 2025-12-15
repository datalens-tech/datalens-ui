import type {ConnectorType, EntryScope} from 'shared';
import type {SharedEntryPermissions} from 'shared/schema';
import {S3_BASED_CONNECTORS} from 'ui/constants';

import {FieldKey} from '../../constants';
import type {ConnectionEntry} from '../../store';
import type {FormDict} from '../../typings';

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
