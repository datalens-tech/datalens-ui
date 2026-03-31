import {CONNECTOR_VISIBILITY_MODE, ConnectorType} from 'shared/constants';
import type {ConnectorFormItem} from 'shared/schema';
import type {DatalensGlobalState} from 'ui';
import {FieldKey} from 'ui/units/connections/constants';

const connectionFormInfoItems: ConnectorFormItem['id'][] = ['description', 'hidden'];

function getDbType(state: DatalensGlobalState) {
    const {form} = state.connections;

    return (form[FieldKey.DbType] || form[FieldKey.Type]) as string | undefined;
}

export const showSubmitButtonSelector = (state: DatalensGlobalState) => {
    const apiSchema = state.connections.schema?.apiSchema;
    const isNewConnection = !state.connections.entry?.entryId;
    const {flattenConnectors} = state.connections;
    const dbType = getDbType(state);
    const connectorItem = flattenConnectors.find((item) => item.conn_type === dbType);
    const hasApiSchema = isNewConnection ? Boolean(apiSchema?.create) : Boolean(apiSchema?.edit);
    const hasUncreatableVisibilityMode =
        connectorItem && connectorItem.visibility_mode
            ? connectorItem.visibility_mode !== CONNECTOR_VISIBILITY_MODE.UNCREATABLE
            : undefined;
    const connectionHasNonInfoItems = state.connections.schema?.rows.some(
        (row) =>
            !('items' in row) ||
            row.items.some((item) => !connectionFormInfoItems.includes(item.id)),
    );

    return connectionHasNonInfoItems && (hasUncreatableVisibilityMode ?? hasApiSchema);
};

export const showCheckButtonSelector = (state: DatalensGlobalState) => {
    const {innerForm, schema} = state.connections;

    // TODO: remove after BI-6458
    if (innerForm.mdb_fill_mode === 'conn-manager') {
        return false;
    }

    const dbType = getDbType(state);

    // TODO: remove after BI-6458
    if (dbType === ConnectorType.Trino && innerForm.mdb_fill_mode === 'cloud') {
        return false;
    }

    return Boolean(schema?.apiSchema?.check);
};
