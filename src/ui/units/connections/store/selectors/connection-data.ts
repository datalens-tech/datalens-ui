import type {ConnectorType} from 'shared';
import type {DatalensGlobalState} from 'ui';

import {FieldKey} from '../../constants';

export const connectionDataSelector = (state: DatalensGlobalState) => {
    return state.connections.connectionData;
};

export const connectionTypeSelector = (state: DatalensGlobalState) => {
    return state.connections.connectionData[FieldKey.DbType] as ConnectorType | undefined;
};

export const connectionIdSelector = (state: DatalensGlobalState) => {
    return state.connections.connectionData[FieldKey.Id] as string | undefined;
};

export const workbookIdSelector = (state: DatalensGlobalState) => {
    return state.connections.connectionData[FieldKey.WorkbookId] as string | undefined;
};

export const collectionIdSelector = (state: DatalensGlobalState) => {
    return state.connections.connectionData[FieldKey.CollectionId] as string | undefined;
};
