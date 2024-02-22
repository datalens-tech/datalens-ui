import {registry} from 'ui/registry';

import {RESET_DATASET_STATE} from '../actions/types/dataset';
import {getInitialState, initialPreview} from '../constants';
import {DatasetReduxAction, DatasetReduxState} from '../types';

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
        });

        return dataset(initialState, action);
    }

    return dataset(state, action);
};

export default datasetReducer;
