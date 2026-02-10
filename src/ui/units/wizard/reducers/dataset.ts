import type {DatasetApiError, DatasetOptions, DatasetWithDelegation, Field, Link} from 'shared';
import type {DataLensApiError} from 'typings';

import type {ResetWizardStoreAction} from '../actions';
import type {DatasetAction} from '../actions/dataset';
import {
    SET_DATASET,
    SET_DATASETS,
    SET_DATASET_API_ERRORS,
    SET_DATASET_DELEGATION,
    SET_DATASET_LOADING,
    SET_DATASET_SCHEMA,
    SET_LINKS,
    SET_ORIGINAL_DATASETS,
} from '../actions/dataset';

export interface DatasetState {
    loading: boolean;
    loaded: boolean;
    dataset: DatasetWithDelegation | undefined;
    datasetId: string | undefined;
    datasets: DatasetWithDelegation[];
    datasetApiErrors: DatasetApiError[];
    options: DatasetOptions | undefined;
    links: Link[];
    dimensions: Field[];
    measures: Field[];
    error: DataLensApiError | undefined;
    originalDatasets: Record<string, DatasetWithDelegation>;
}

const initialState: DatasetState = {
    // Is the dataset loaded (current)
    loading: false,

    // Is the dataset loaded (current)
    loaded: false,

    // Dataset (current)
    dataset: undefined,

    // Datasets (all)
    datasets: [],

    datasetApiErrors: [],

    options: undefined,

    // Connections (between datasets)
    links: [],

    // Measurements of the dataset (current)
    dimensions: [],

    // Indicators of the dataset (current)
    measures: [],

    error: undefined,

    datasetId: undefined,

    originalDatasets: {},
};

export function dataset(
    state = initialState,
    action: DatasetAction | ResetWizardStoreAction,
): DatasetState {
    switch (action.type) {
        case SET_DATASET_LOADING: {
            const {loading} = action;
            return {
                ...state,
                loading,
            };
        }
        case SET_DATASET_SCHEMA: {
            const {dataset, resultSchema} = action;

            const {dataset: currentDataset, datasets} = state;

            if (dataset.dataset) {
                dataset.dataset.result_schema = resultSchema;
            } else {
                // depricated field, needed for backward compatibility
                dataset.result_schema = resultSchema;
            }

            const storedDataset = datasets.find((storedDataset) => storedDataset.id === dataset.id);

            if (storedDataset) {
                if (storedDataset.dataset) {
                    storedDataset.dataset.result_schema = resultSchema;
                } else {
                    // depricated field, needed for backward compatibility
                    storedDataset.result_schema = resultSchema;
                }
            }

            let measures;
            let dimensions;
            if (dataset.id === currentDataset?.id) {
                dimensions = action.dimensions;
                measures = action.measures;
            } else {
                dimensions = state.dimensions;
                measures = state.measures;
            }

            return {
                ...state,
                datasets,
                dimensions,
                measures,
            };
        }
        case SET_DATASET: {
            const {datasets} = state;
            const {dataset, dimensions = [], measures = [], options, error} = action;

            const datasetId: string | undefined = dataset ? dataset.id : action.datasetId;

            const updatedDatasets = [...datasets];

            if (error) {
                return {
                    ...state,
                    error,
                    dataset: dataset || state.dataset,
                    datasetId,
                    loaded: true,
                    loading: false,
                };
            } else {
                if (
                    dataset &&
                    !datasets.find((existingDataset) => existingDataset.id === dataset.id)
                ) {
                    updatedDatasets.push(dataset);
                }

                return {
                    ...state,
                    dataset,
                    datasets: updatedDatasets,
                    dimensions,
                    measures,
                    options,
                    datasetId,
                    error: undefined,
                    loaded: true,
                    loading: false,
                };
            }
        }
        case SET_LINKS: {
            const {links = []} = action;
            return {
                ...state,
                links,
            };
        }
        case SET_DATASETS: {
            const {datasets = []} = action;
            return {
                ...state,
                datasets,
            };
        }
        case SET_ORIGINAL_DATASETS: {
            const {originalDatasets} = action;
            return {
                ...state,
                originalDatasets,
            };
        }
        case SET_DATASET_API_ERRORS: {
            const {datasetApiErrors} = action;
            return {
                ...state,
                datasetApiErrors,
            };
        }
        case SET_DATASET_DELEGATION: {
            const {datasetId, delegation} = action.payload;
            let newDataset = state.dataset;
            let newOriginalDataset = state.originalDatasets[datasetId];
            if (datasetId === newDataset?.id) {
                newDataset = {...newDataset, isDelegated: delegation};
            }
            if (datasetId === newOriginalDataset?.id) {
                newOriginalDataset = {...newOriginalDataset, isDelegated: delegation};
            }
            const newDatasetArr = state.datasets.map((currentDataset) => {
                if (datasetId === currentDataset.id) {
                    return {...currentDataset, isDelegated: delegation};
                }
                return currentDataset;
            });
            return {
                ...state,
                dataset: newDataset,
                datasets: newDatasetArr,
                originalDatasets: {
                    ...state.originalDatasets,
                    [newOriginalDataset.id]: newOriginalDataset,
                },
            };
        }
        default:
            return state;
    }
}
