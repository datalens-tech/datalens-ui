import {createSelector} from 'reselect';
import type {Dataset, Field, Placeholder, Shared} from 'shared';
import {
    DatasetFieldType,
    createMeasureNames,
    createMeasureValues,
    getResultSchemaFromDataset,
    isDimensionField,
    isParameter,
    isVisualizationWithLayers,
} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {extractFieldsFromDatasets} from 'units/wizard/utils/helpers';
import {isFieldVisible} from 'units/wizard/utils/wizard';

export const selectDataset = (state: DatalensGlobalState) => state.wizard.dataset.dataset;

export const selectDatasets = (state: DatalensGlobalState) => state.wizard.dataset.datasets;

export const selectLinks = (state: DatalensGlobalState) => state.wizard.dataset.links;

export const selectFields = (state: DatalensGlobalState) => {
    if (
        state.wizard.dataset.loaded &&
        state.wizard.dataset.dimensions &&
        state.wizard.dataset.measures
    ) {
        return [...state.wizard.dataset.dimensions, ...state.wizard.dataset.measures].filter(
            (field) => !field.quickFormula,
        );
    } else {
        return [];
    }
};

export const selectDatasetError = (state: DatalensGlobalState) => state.wizard.dataset.error;

export const selectMeasures = (state: DatalensGlobalState) => state.wizard.dataset.measures;

export const selectDimensionFields = (state: DatalensGlobalState) =>
    state.wizard.dataset.dimensions;

export const selectDimensions = createSelector(selectDimensionFields, (dimensions) => {
    return dimensions.filter(isDimensionField);
});

export const selectParameters = createSelector(selectDimensionFields, (dimensions) => {
    return dimensions.filter(isParameter);
});

export const selectVisibleDimensions = (state: DatalensGlobalState) =>
    selectDimensions(state).filter(isFieldVisible);

export const selectDatasetLoading = (state: DatalensGlobalState) => state.wizard.dataset.loading;

export const selectDatasetLoaded = (state: DatalensGlobalState) => state.wizard.dataset.loaded;

export const selectDatasetId = (state: DatalensGlobalState) => state.wizard.dataset.datasetId;

export const selectOriginalDatasets = (state: DatalensGlobalState) =>
    state.wizard.dataset.originalDatasets;

export const selectOriginalDatasetById = createSelector(
    [selectOriginalDatasets, (_state: DatalensGlobalState, id: string) => id],
    (datasets, id: string): Dataset | undefined => {
        return datasets[id];
    },
);

export const selectOriginalParameters = createSelector(
    (state: DatalensGlobalState, id: string) => selectOriginalDatasetById(state, id),
    (originalDataset: Dataset | undefined) => {
        const schema = getResultSchemaFromDataset(originalDataset);

        return schema.filter(isParameter);
    },
);

export const selectExtendedDimensionsAndMeasures = (
    visualization: Shared['visualization'],
    dimensions: Field[],
    measures: Field[],
) => {
    let updatedDimensions = [...dimensions];
    let updatedMeasures = [...measures];
    if (visualization) {
        let placeholders;

        if (isVisualizationWithLayers(visualization)) {
            const {layers, selectedLayerId} = visualization;
            const layerId = selectedLayerId || layers[0].id;
            placeholders =
                (visualization.layers.find((layer) => layer.layerSettings.id === layerId) || {})
                    .placeholders || [];
        } else {
            placeholders = visualization.placeholders || [];
        }

        const selectedItems = placeholders
            .reduce((a: Field[], b: Placeholder) => a.concat(b.items), [])
            .filter((selectedItem: Field) => selectedItem.type === 'MEASURE');

        if (selectedItems.length) {
            updatedDimensions = [...updatedDimensions, createMeasureNames()];

            updatedMeasures = [...updatedMeasures, createMeasureValues()];
        }
    }

    return {
        dimensions: updatedDimensions,
        measures: updatedMeasures,
    };
};

export const selectDimensionsByDataset = (
    state: DatalensGlobalState,
): Record<string, Record<string, Field>> => {
    return extractFieldsFromDatasets(state.wizard.dataset.datasets)
        .filter((field) => isFieldVisible(field) && field.type === DatasetFieldType.Dimension)
        .reduce((acc: Record<string, Record<string, Field>>, field: Field) => {
            acc[field.datasetId] = acc[field.datasetId] || {};

            acc[field.datasetId][field.guid] = field;

            return acc;
        }, {});
};

export const selectDatasetApiErrors = (state: DatalensGlobalState) =>
    state.wizard.dataset.datasetApiErrors;
