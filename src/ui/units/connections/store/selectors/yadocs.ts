import type {DatalensGlobalState} from 'ui';

export const yadocsAddSectionStateSelector = (state: DatalensGlobalState) => {
    return state.connections.yadocs.addSectionState;
};
