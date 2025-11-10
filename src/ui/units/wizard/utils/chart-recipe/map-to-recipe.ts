import type {
    ChartsConfig,
    ServerField,
    WizardDatasetField,
    WizardVisualizationId,
} from '../../../../../shared';
import {PlaceholderId, getFakeTitleOrTitle} from '../../../../../shared';

import type {FilterValue, RecipeField, WizardChartRecipe} from './types';

export function getChartRecipeFromWizardConfig(config: Partial<ChartsConfig>): WizardChartRecipe {
    const mapFieldToRecipeField = (item: ServerField) => {
        const wizardField = item as WizardDatasetField;

        return {
            title: getFakeTitleOrTitle(wizardField),
            formula: wizardField.formula || item.title,
        } as RecipeField;
    };

    const layers: WizardChartRecipe['layers'] = [];
    if (config.visualization?.layers) {
        // todo: map layers
    } else {
        const xPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.X,
        );
        const x: RecipeField[] | undefined = xPlaceholder?.items?.map(mapFieldToRecipeField);

        const yPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Y,
        );
        const y: RecipeField[] | undefined = yPlaceholder?.items?.map(mapFieldToRecipeField);

        const colors: RecipeField[] | undefined = config.colors?.map(mapFieldToRecipeField);
        const split: RecipeField[] | undefined = config.segments?.map(mapFieldToRecipeField);

        const columnPlaceholder = config.visualization?.placeholders.find(
            (p) =>
                p.id === PlaceholderId.FlatTableColumns || p.id === PlaceholderId.PivotTableColumns,
        );
        const columns: RecipeField[] | undefined =
            columnPlaceholder?.items?.map(mapFieldToRecipeField);

        const rowsPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.PivotTableRows,
        );
        const rows: RecipeField[] | undefined = rowsPlaceholder?.items?.map(mapFieldToRecipeField);

        const measuresPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Measures,
        );
        const measures: RecipeField[] | undefined =
            measuresPlaceholder?.items?.map(mapFieldToRecipeField);

        const filters: FilterValue[] | undefined = config.filters?.map((item) => ({
            field: mapFieldToRecipeField(item as WizardDatasetField),
            operation: item.filter.operation.code,
            values: item.filter.value as string[],
        }));

        layers.push({
            type: config.visualization?.id as WizardVisualizationId,
            x,
            y,
            colors,
            columns,
            rows,
            measures,
            split,
            filters,
        });
    }

    return {
        datasetId: config.datasetsIds?.[0] ?? '',
        datasetUpdates: config.updates?.map((item) => {
            return {
                action: item.action,
                field: {
                    title: item.field.title,
                    formula: item.field.formula,
                    default_value: item.field.default_value,
                },
            };
        }),
        layers,
    };
}
