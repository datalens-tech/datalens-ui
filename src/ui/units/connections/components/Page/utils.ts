import type {ConnectorType} from 'shared';
import type {GetEntryResponse, SharedEntryPermissions} from 'shared/schema';
import {S3_BASED_CONNECTORS} from 'ui/constants';

import {FieldKey} from '../../constants';
import type {FormDict} from '../../typings';

export const isS3BasedConnForm = (connectionData: FormDict, paramsType?: string) => {
    const type = (connectionData[FieldKey.DbType] || paramsType) as ConnectorType;
    return S3_BASED_CONNECTORS.includes(type);
};

export const isListPageOpened = (pathname = '') => {
    return /new$/.test(pathname);
};

export const getIsSharedConnection = (
    entry?: GetEntryResponse,
): entry is GetEntryResponse & {collectionId: string; fullPermissions: SharedEntryPermissions} => {
    return Boolean(entry?.collectionId);
};
