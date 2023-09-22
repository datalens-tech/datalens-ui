import type {DatalensGlobalState} from 'ui';

export const initialFormSelector = (state: DatalensGlobalState) => {
    return state.connections.initialForm;
};
