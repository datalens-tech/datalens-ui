import {getSdk} from 'ui/libs/schematic-sdk';

import type {
    ChartsConfig,
    Dataset,
    DatasetField,
    ServerColor,
    ServerField,
    ServerFilter,
    ServerPlaceholder,
    ServerVisualization,
    ServerVisualizationLayer,
} from '../../../../shared';
import {
    ChartsConfigVersion,
    PlaceholderId,
    WizardVisualizationId,
    getFakeTitleOrTitle,
} from '../../../../shared';

import {getAvailableVisualizations} from './visualization';

type RecipeField = {
    title: string;
    formula: string;
};

type FilterValue = {
    field: RecipeField;
    operation: string;
    values: string[];
};

export type WizardChartRecipe = {
    /*  The Id of the dataset whose fields are used to fill in the axes/colors/filters, etc. of the chart recipe
     */
    datasetId: string;
    /**
     * The chart layer. The most common case is a single-layer chart.
     * However, if you want to combine several types of visualizations (for example, a line chart and a bar chart),
     * then each type of visualization will be located on a separate layer.
     */
    layers: {
        /* visualization type - for example, linear, pie, or bar charts */
        type: WizardVisualizationId;

        x?: RecipeField[];
        y?: RecipeField[];
        colors?: RecipeField[];
        filters?: FilterValue[];
    }[];
};

function getServerField({item, dataset}: {item: RecipeField; dataset: Dataset}) {
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
    return {
        title: item.title,
        formula: item.formula,
        datasetId: dataset.id,
    };
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

    const availableTypes = getAvailableVisualizations();
    const layers: Partial<ServerVisualizationLayer>[] = [];

    recipe.layers.forEach((layer) => {
        const chartType = layer.type;

        if (!chartType) {
            throw Error('The chart type must be defined for each layer.');
        }

        if (!availableTypes.some((t) => t.id === chartType)) {
            throw Error(`Unsupported chart type "${chartType}"`);
        }

        const placeholders: ServerPlaceholder[] = [];
        switch (chartType) {
            case WizardVisualizationId.Line:
            case WizardVisualizationId.Column:
            case WizardVisualizationId.Column100p:
            case WizardVisualizationId.Area:
            case WizardVisualizationId.Area100p:
            case WizardVisualizationId.Scatter: {
                placeholders.push({
                    id: PlaceholderId.X,
                    items: (layer.x ?? []).map((item) =>
                        getServerField({item, dataset}),
                    ) as ServerField[],
                });
                placeholders.push({
                    id: PlaceholderId.Y,
                    items: (layer.y ?? []).map((item) =>
                        getServerField({item, dataset}),
                    ) as ServerField[],
                });
                break;
            }
        }

        const colors: ServerColor[] = (layer.colors ?? []).map(
            (item) => getServerField({item, dataset}) as ServerColor,
        );

        const layerFilterValues: FilterValue[] = layer.filters ?? [];
        const filters: ServerFilter[] = layerFilterValues.map((item) => {
            const field = getServerField({item: item.field, dataset}) as ServerField;
            return {
                ...field,
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

    let visualization: ServerVisualization;
    if (layers.length === 1) {
        visualization = {
            id: layers[0].id ?? '',
            placeholders: layers[0].placeholders ?? [],
        };

        return {
            colors: layers[0]?.commonPlaceholders?.colors ?? [],
            extraSettings: undefined,
            filters: layers[0]?.commonPlaceholders?.filters ?? [],
            hierarchies: [],
            labels: [],
            links: [],
            sort: [],
            tooltips: [],
            type: 'datalens',
            updates: [],
            visualization,
            shapes: [],
            version: ChartsConfigVersion.V14,
            datasetsIds: [recipe.datasetId],
            datasetsPartialFields: [],
            segments: [],
        };
    } else {
        // todo: check combined and geo charts
        visualization = {
            id: '',
            placeholders: [],
        };

        return {
            colors: [],
            extraSettings: undefined,
            filters: [],
            hierarchies: [],
            labels: [],
            links: [],
            sort: [],
            tooltips: [],
            type: 'datalens',
            updates: [],
            visualization,
            shapes: [],
            version: ChartsConfigVersion.V14,
            datasetsIds: [recipe.datasetId],
            datasetsPartialFields: [],
            segments: [],
        };
    }
}

export function getChartReceiptFromWizardConfig(config: Partial<ChartsConfig>): WizardChartRecipe {
    const layers: WizardChartRecipe['layers'] = [];
    if (config.visualization?.layers) {
        // todo: map layers
    } else {
        const xPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.X,
        );
        const x: RecipeField[] | undefined = xPlaceholder?.items?.map((item) => ({
            title: getFakeTitleOrTitle(item),
            formula: (item as unknown as DatasetField).formula || item.title,
        }));

        const yPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Y,
        );
        const y: RecipeField[] | undefined = yPlaceholder?.items?.map((item) => ({
            title: getFakeTitleOrTitle(item),
            formula: (item as unknown as DatasetField).formula || item.title,
        }));

        const colors: RecipeField[] | undefined = config.colors?.map((item) => ({
            title: getFakeTitleOrTitle(item),
            formula: (item as unknown as DatasetField).formula || item.title,
        }));

        const filters: FilterValue[] | undefined = config.filters?.map((item) => ({
            field: {
                title: getFakeTitleOrTitle(item as unknown as ServerField),
                formula: (item as unknown as DatasetField).formula || item.title,
            },
            operation: item.filter.operation.code,
            values: item.filter.value as string[],
        }));

        layers.push({
            type: config.visualization?.id as WizardVisualizationId,
            x,
            y,
            colors,
            filters,
        });
    }

    return {
        datasetId: config.datasetsIds?.[0] ?? '',
        layers,
    };
}
