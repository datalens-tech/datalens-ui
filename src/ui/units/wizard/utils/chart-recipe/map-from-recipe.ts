import {v1 as uuidv1} from 'uuid';

import type {
    ChartsConfig,
    Dataset,
    ServerColor,
    ServerField,
    ServerFieldUpdate,
    ServerFilter,
    ServerPlaceholder,
    ServerVisualization,
    ServerVisualizationLayer,
} from '../../../../../shared';
import {
    ChartsConfigVersion,
    DatasetFieldType,
    PlaceholderId,
    PseudoFieldTitle,
    WizardVisualizationId,
} from '../../../../../shared';
import {getSdk} from '../../../../libs/schematic-sdk';
import {receiveVisualization} from '../../actions';
import {getAvailableVisualizations} from '../visualization';

import type {FilterValue, RecipeField, WizardChartRecipe} from './types';

function getServerField({
    item,
    dataset,
    updates,
}: {
    item: RecipeField;
    dataset: Dataset;
    updates: ServerFieldUpdate[];
}) {
    if (item.title === PseudoFieldTitle.MeasureNames) {
        return {
            title: item.title,
            type: DatasetFieldType.Pseudo,
        };
    }

    const datasetFields = dataset.dataset.result_schema;
    const datasetField = datasetFields.find((d) => d.title === item.title);
    if (datasetField) {
        return {
            title: datasetField.title,
            guid: datasetField.guid,
            datasetId: dataset.id,
        };
    }

    // field was renamed
    const originalDatasetField = datasetFields.find((d) => d.formula === item.formula);
    if (originalDatasetField) {
        return {
            fakeTitle: item.title,
            title: originalDatasetField.title,
            guid: originalDatasetField.guid,
            datasetId: dataset.id,
        };
    }

    // local chart field - not from dataset
    const localField = updates.find((d) => d.field.title === item.title)?.field;
    if (localField) {
        return {
            title: localField.title,
            guid: localField.guid,
            datasetId: dataset.id,
        };
    }

    // Invalid field - it will most likely be displayed in wizard with an error.
    throw Error('The field was not found in the chart or dataset');
}

export async function getWizardConfigFromRecipe({
    recipe,
}: {
    recipe: Partial<WizardChartRecipe>;
}): Promise<ChartsConfig> {
    if (!recipe) {
        throw Error('Empty chart recipe');
    }

    if (!recipe.datasetId) {
        throw Error('The chart recipe must contain the datasetId.');
    }

    const dataset = await getSdk().sdk.bi.getDatasetByVersion({
        datasetId: recipe.datasetId,
    });

    if (!recipe.layers?.length) {
        throw Error(
            'The chart recipe should contain a "layers" field with a configuration of visualizations inside each layer.',
        );
    }

    const updates: ServerFieldUpdate[] =
        recipe.datasetUpdates?.map((item) => {
            const datasetField = dataset.dataset.result_schema.find(
                (d) => d.title === item.field.title,
            );

            return {
                action: item.action,
                field: {
                    ...datasetField,
                    ...item.field,
                    datasetId: dataset.id,
                    guid: datasetField?.guid ?? uuidv1(),
                },
            };
        }) ?? [];

    const mapRecipeFieldToServerField = (item: RecipeField) =>
        getServerField({item, dataset, updates}) as unknown as ServerField;

    const availableTypes = getAvailableVisualizations();
    const layers: Partial<ServerVisualizationLayer>[] = [];
    const segments: ServerField[] = [];

    // eslint-disable-next-line complexity
    recipe.layers.forEach((layer) => {
        const chartType = layer.type;

        if (!chartType) {
            throw Error('The chart type must be defined for each layer.');
        }

        if (!availableTypes.some((t) => t.id === chartType)) {
            throw Error(`Unsupported chart type "${chartType}"`);
        }

        const placeholders: ServerPlaceholder[] = [];
        const colors: ServerColor[] = [];
        switch (chartType) {
            case WizardVisualizationId.Line:
            case WizardVisualizationId.Column:
            case WizardVisualizationId.Column100p:
            case WizardVisualizationId.Area:
            case WizardVisualizationId.Area100p:
            case WizardVisualizationId.Bar:
            case WizardVisualizationId.Bar100p:
            case WizardVisualizationId.Scatter: {
                placeholders.push({
                    id: PlaceholderId.X,
                    items: (layer.x ?? []).map(mapRecipeFieldToServerField),
                });
                placeholders.push({
                    id: PlaceholderId.Y,
                    items: (layer.y ?? []).map(mapRecipeFieldToServerField),
                });
                colors.push(...(layer.colors ?? []).map(mapRecipeFieldToServerField));
                segments.push(...(layer.split ?? []).map(mapRecipeFieldToServerField));
                break;
            }
            case WizardVisualizationId.Pie:
            case WizardVisualizationId.Donut: {
                placeholders.push({
                    id: PlaceholderId.Dimensions,
                    items: [],
                });
                placeholders.push({
                    id: PlaceholderId.Colors,
                    items: (layer.colors ?? []).map(mapRecipeFieldToServerField),
                });
                placeholders.push({
                    id: PlaceholderId.Measures,
                    items: (layer.measures ?? []).map(mapRecipeFieldToServerField),
                });
                break;
            }
            case WizardVisualizationId.FlatTable: {
                placeholders.push({
                    id: PlaceholderId.FlatTableColumns,
                    items: (layer.columns ?? []).map(mapRecipeFieldToServerField),
                });
                break;
            }
            case WizardVisualizationId.PivotTable: {
                placeholders.push({
                    id: PlaceholderId.PivotTableColumns,
                    items: (layer.columns ?? []).map(mapRecipeFieldToServerField),
                });
                placeholders.push({
                    id: PlaceholderId.PivotTableRows,
                    items: (layer.rows ?? []).map(mapRecipeFieldToServerField),
                });
                placeholders.push({
                    id: PlaceholderId.Measures,
                    items: (layer.measures ?? []).map(mapRecipeFieldToServerField),
                });
                break;
            }
        }

        const layerFilterValues: FilterValue[] = layer.filters ?? [];
        const filters: ServerFilter[] = layerFilterValues.map((item) => {
            const field = getServerField({item: item.field, dataset, updates});

            return {
                ...(field as unknown as ServerField),
                filter: {
                    operation: {
                        code: item.operation,
                    },
                    value: item.values,
                },
            };
        });

        const newLayer: Partial<ServerVisualizationLayer> = {
            id: chartType,
            placeholders,
            commonPlaceholders: {
                colors,
                labels: [],
                tooltips: [],
                filters,
                sort: [],
            },
        };
        layers.push(newLayer);
    });

    let config: ChartsConfig;
    if (layers.length === 1) {
        const visualization: ServerVisualization = {
            id: layers[0].id ?? '',
            placeholders: layers[0].placeholders ?? [],
        };

        config = {
            colors: layers[0]?.commonPlaceholders?.colors ?? [],
            extraSettings: undefined,
            filters: layers[0]?.commonPlaceholders?.filters ?? [],
            hierarchies: [],
            labels: [],
            links: [],
            sort: [],
            tooltips: [],
            type: 'datalens',
            updates,
            visualization,
            shapes: [],
            version: ChartsConfigVersion.V14,
            datasetsIds: [recipe.datasetId],
            datasetsPartialFields: [],
            segments,
        };
    } else {
        // todo: check combined and geo charts
        const visualization: ServerVisualization = {
            id: '',
            placeholders: [],
        };

        config = {
            colors: [],
            extraSettings: undefined,
            filters: [],
            hierarchies: [],
            labels: [],
            links: [],
            sort: [],
            tooltips: [],
            type: 'datalens',
            updates,
            visualization,
            shapes: [],
            version: ChartsConfigVersion.V14,
            datasetsIds: [recipe.datasetId],
            datasetsPartialFields: [],
            segments,
        };
    }

    // @ts-ignore
    const {visualization} = receiveVisualization({
        ...config,
        datasets: [dataset],
    });

    return {
        ...config,
        visualization,
    };
}
