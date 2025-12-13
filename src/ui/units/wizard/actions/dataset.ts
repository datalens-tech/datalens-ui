import type {Dispatch} from 'redux';
import type {
    Dataset,
    DatasetApiError,
    DatasetOptions,
    Field,
    HierarchyField,
    Link,
    Update,
} from 'shared';
import type {DataLensApiError} from 'typings';
import type {DatalensGlobalState} from 'ui';
import {selectDimensionsByDataset} from 'units/wizard/selectors/dataset';

import {prepareDataset} from './index';

export const SET_DATASET = Symbol('wizard/dataset/SET_DATASET');
export const SET_DATASET_LOADING = Symbol('wizard/dataset/SET_DATASET_LOADING');
export const SET_DATASET_SCHEMA = Symbol('wizard/dataset/SET_DATASET_SCHEMA');
export const SET_LINKS = Symbol('wizard/dataset/SET_LINKS');
export const SET_HIERARCHIES = Symbol('wizard/dataset/SET_HIERARCHIES');
export const SET_DATASETS = Symbol('wizard/dataset/SET_DATASETS');
export const SET_ORIGINAL_DATASETS = Symbol('wizard/dataset/SET_ORIGINAL_DATASETS');
export const SET_DATASET_API_ERRORS = Symbol('wizard/dataset/SET_DATASET_API_ERRORS');
export const SET_DATASET_DELEGATION = Symbol('wizard/dataset/SET_DATASET_DELEGATION');

interface SetDatasetsAction {
    type: typeof SET_DATASETS;
    datasets: Dataset[];
}

interface SetDatasetDelegationAction {
    type: typeof SET_DATASET_DELEGATION;
    payload: {datasetId: string; delegation: boolean};
}

export function setDatasetDelegation(
    payload: SetDatasetDelegationAction['payload'],
): SetDatasetDelegationAction {
    return {
        type: SET_DATASET_DELEGATION,
        payload,
    };
}

export function setDatasets({datasets}: {datasets: Dataset[]}): SetDatasetsAction {
    return {
        type: SET_DATASETS,
        datasets,
    };
}

interface SetDatasetLoadingAction {
    type: typeof SET_DATASET_LOADING;
    loading: boolean;
}

export function setDatasetLoading({loading}: {loading: boolean}): SetDatasetLoadingAction {
    return {
        type: SET_DATASET_LOADING,
        loading,
    };
}

interface SetDatasetAction {
    type: typeof SET_DATASET;
    dataset?: Dataset;
    error?: DataLensApiError;
    measures?: Field[];
    dimensions?: Field[];
    options?: DatasetOptions;
    datasetId?: string;
}

export function setDataset({
    dataset,
    widgetDataset,
    error,
    datasetId,
}: {
    dataset?: Dataset;
    widgetDataset?: Dataset;
    error?: DataLensApiError;
    datasetId?: string;
}): SetDatasetAction {
    if (error) {
        return {
            type: SET_DATASET,
            dataset,
            error,
            datasetId,
        };
    } else if (dataset) {
        const {
            dataset: mergedDataset,
            dimensions,
            measures,
            options,
        } = prepareDataset({
            dataset,
            widgetDataset,
        });

        return {
            type: SET_DATASET,
            dataset: mergedDataset,
            measures,
            dimensions,
            options,
            error,
            datasetId,
        };
    } else {
        return {
            type: SET_DATASET,
            datasetId,
        };
    }
}

interface SetLinksAction {
    type: typeof SET_LINKS;
    links: Link[];
}

export function setLinks({links = []}: {links: Link[]}) {
    return {
        type: SET_LINKS,
        links,
    };
}

export interface SetHierarchiesAction {
    type: typeof SET_HIERARCHIES;
    hierarchies: HierarchyField[];
}

function _setHierarchies({
    hierarchies = [],
}: {
    hierarchies: HierarchyField[];
}): SetHierarchiesAction {
    return {
        type: SET_HIERARCHIES,
        hierarchies,
    };
}

export function setHierarchies({hierarchies = []}: {hierarchies: HierarchyField[]}) {
    return (dispatch: Dispatch, getState: () => DatalensGlobalState) => {
        const dimensionsByDataset = selectDimensionsByDataset(getState());

        hierarchies = hierarchies.map((hierarchy: HierarchyField) => {
            const fields = hierarchy.fields.reduce((acc: Field[], hierarchyField) => {
                const fieldFromDataset =
                    dimensionsByDataset[hierarchyField.datasetId]?.[hierarchyField.guid];

                const columnSettings = hierarchyField.columnSettings;

                if (fieldFromDataset) {
                    acc.push({
                        ...fieldFromDataset,
                        columnSettings,
                    });
                }

                return acc;
            }, []);

            return {
                ...hierarchy,
                fields,
                valid: !fields.length ? false : hierarchy.valid,
                conflict: !fields.length ? 'invalid' : hierarchy.conflict,
                undragable: !fields.length ? true : hierarchy.undragable,
            };
        });

        dispatch(_setHierarchies({hierarchies}));
    };
}

interface SetDatasetSchemaAction {
    type: typeof SET_DATASET_SCHEMA;
    dataset: Dataset;
    resultSchema: any;
    dimensions: Field[];
    measures: Field[];
    updates: Update[];
}

interface SetDatasetSchemaArgs {
    dataset: Dataset;
    resultSchema: any;
    dimensions: Field[];
    measures: Field[];
}

export function setDatasetSchema({
    dataset,
    resultSchema,
    dimensions,
    measures,
}: SetDatasetSchemaArgs) {
    return {
        type: SET_DATASET_SCHEMA,
        dataset,
        resultSchema,
        dimensions,
        measures,
    };
}

interface SetOriginalDatasetsAction {
    type: typeof SET_ORIGINAL_DATASETS;
    originalDatasets: Record<string, Dataset>;
}

interface SetOriginalDatasetsArgs {
    originalDatasets: Record<string, Dataset>;
}

export function setOriginalDatasets({
    originalDatasets,
}: SetOriginalDatasetsArgs): SetOriginalDatasetsAction {
    return {
        type: SET_ORIGINAL_DATASETS,
        originalDatasets,
    };
}

interface SetDatasetApiErrorsAction {
    type: typeof SET_DATASET_API_ERRORS;
    datasetApiErrors: DatasetApiError[];
}

interface SetDatasetApiErrorsArgs {
    datasetApiErrors: DatasetApiError[];
}

export function setDatasetApiErrors({
    datasetApiErrors,
}: SetDatasetApiErrorsArgs): SetDatasetApiErrorsAction {
    return {
        type: SET_DATASET_API_ERRORS,
        datasetApiErrors,
    };
}

export type DatasetAction =
    | SetHierarchiesAction
    | SetLinksAction
    | SetDatasetAction
    | SetDatasetDelegationAction
    | SetDatasetLoadingAction
    | SetDatasetsAction
    | SetDatasetSchemaAction
    | SetOriginalDatasetsAction
    | SetDatasetApiErrorsAction;
