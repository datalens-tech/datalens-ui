import {registry} from 'ui/registry';

import {RESET_DATASET_STATE} from '../actions/types/dataset';
import {getCurrentTab, getInitialState, initialPreview} from '../constants';
import type {DatasetReduxAction, DatasetReduxState} from '../types';

import dataset from './dataset';

const datasetReducer = (state: DatasetReduxState, action: DatasetReduxAction) => {
    if (action.type === RESET_DATASET_STATE) {
        const {extractEntryId} = registry.common.functions.getAll();
        const hasEntryId = Boolean(extractEntryId(window.location.pathname));
        const initialState = getInitialState({
            isLoading: hasEntryId,
            preview: {
                ...initialPreview,
                isLoading: false,
            },
            currentTab: getCurrentTab(),
        });

        return dataset(initialState, action);
    }

    return dataset(state, action);
};

export default datasetReducer;
