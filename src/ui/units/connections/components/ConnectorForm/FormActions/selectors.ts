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
    return Boolean(state.connections.schema?.apiSchema?.check);
};
