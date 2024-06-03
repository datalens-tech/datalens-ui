import type {DatalensGlobalState} from 'ui';

export const showSubmitButtonSelector = (state: DatalensGlobalState) => {
    const apiSchema = state.connections.schema?.apiSchema;
    const isNewConnection = !state.connections.entry?.entryId;

    return isNewConnection ? Boolean(apiSchema?.create) : Boolean(apiSchema?.edit);
};

export const showCheckButtonSelector = (state: DatalensGlobalState) => {
    return Boolean(state.connections.schema?.apiSchema?.check);
};
