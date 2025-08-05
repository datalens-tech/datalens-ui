import type {DatalensGlobalState} from 'ui';
import {FieldKey} from 'ui/units/connections/constants';

export const showSubmitButtonSelector = (state: DatalensGlobalState) => {
    const apiSchema = state.connections.schema?.apiSchema;
    const isNewConnection = !state.connections.entry?.entryId;
    const {form, flattenConnectors} = state.connections;
    const type = (form[FieldKey.DbType] || form[FieldKey.Type]) as string | undefined;
    const connectorItem = flattenConnectors.find((item) => item.conn_type === type);
    const hasApiSchema = isNewConnection ? Boolean(apiSchema?.create) : Boolean(apiSchema?.edit);
    const hasUncreatableVisibilityMode =
        connectorItem && connectorItem.visibility_mode
            ? connectorItem.visibility_mode !== 'uncreatable'
            : undefined;

    return hasUncreatableVisibilityMode ?? hasApiSchema;
};

export const showCheckButtonSelector = (state: DatalensGlobalState) => {
    // Remove after BI backend has supported params checking in case of anonymous connection
    if (state.connections.innerForm.mdb_fill_mode === 'conn-manager') {
        return false;
    }
    if (state.connections.connectionData[FieldKey.DbType] === 'trino' &&
        state.connections.innerForm.auth_type === 'mdb_integration') {
        return false;
    }

    return Boolean(state.connections.schema?.apiSchema?.check);
};
