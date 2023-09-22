import {DatalensGlobalState} from 'ui';

export const freeformSourcesSelector = (store: DatalensGlobalState) =>
    store.dataset.freeformSources;
