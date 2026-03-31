import type {DatalensGlobalState} from 'ui';

export const fileSourcesInfoLoadingSelector = (state: DatalensGlobalState) => {
    return state.connections.file.sourcesInfoLoading;
};
