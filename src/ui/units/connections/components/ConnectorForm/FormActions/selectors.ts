import type {DatalensGlobalState} from 'ui';

export const showSubmitButtonSelector = (state: DatalensGlobalState) => {
    const apiSchema = state.connections.schema?.apiSchema;
    const isNewConnection = !state.connections.entry?.entryId;

    return isNewConnection ? Boolean(apiSchema?.create) : Boolean(apiSchema?.edit);
};

export const showCheckButtonSelector = (state: DatalensGlobalState) => {
    // Remove after BI backend has supported params checking in case of anonymous connection
    if (state.connections.innerForm.mdb_fill_mode === 'conn-manager') {
        return false;
    }

    return Boolean(state.connections.schema?.apiSchema?.check);
};
