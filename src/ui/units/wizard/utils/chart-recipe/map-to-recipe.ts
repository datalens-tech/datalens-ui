import {isEmpty} from 'lodash';

import type {
    ChartsConfig,
    ServerField,
    ServerSort,
    WizardDatasetField,
} from '../../../../../shared';
import {BarsColorType, PlaceholderId} from '../../../../../shared';

import type {
    FilterValue,
    RecipeField,
    RecipeFieldUpdate,
    SortingValue,
    WizardChartRecipe,
    WizardRecipeType,
} from './types';

export function getChartRecipeFromWizardConfig(config: Partial<ChartsConfig>): WizardChartRecipe {
    const mapFieldToRecipeField = (item: ServerField | ServerSort) => {
        const wizardField = item as WizardDatasetField;

        return {
            title: wizardField.title,
        } as RecipeField;
    };

    const layers: WizardChartRecipe['layers'] = [];

    const filters: FilterValue[] | undefined = config.filters?.map((item) => ({
        field: mapFieldToRecipeField(item as WizardDatasetField),
        operation: item.filter.operation.code,
        values: item.filter.value as string[],
    }));

    if (config.visualization?.layers) {
        const firstLayer = config.visualization?.layers?.[0];
        const xPlaceholder = firstLayer?.placeholders.find((p) => p.id === PlaceholderId.X);
        const x: RecipeField[] | undefined = xPlaceholder?.items?.map(mapFieldToRecipeField);

        config.visualization.layers.forEach((layerData) => {
            const yPlaceholder = layerData?.placeholders.find((p) => p.id === PlaceholderId.Y);
            const y: RecipeField[] | undefined = yPlaceholder?.items?.map(mapFieldToRecipeField);

            const y2Placeholder = layerData?.placeholders.find((p) => p.id === PlaceholderId.Y2);
            const y2: RecipeField[] | undefined = y2Placeholder?.items?.map(mapFieldToRecipeField);

            const colors: RecipeField[] | undefined =
                layerData.commonPlaceholders.colors?.map(mapFieldToRecipeField);

            const sorting = layerData.commonPlaceholders.sort?.map((d) => {
                return {
                    ...mapFieldToRecipeField(d),
                    direction: d.direction,
                } as SortingValue;
            });

            layers.push({
                type: layerData.id as WizardRecipeType,
                x,
                y,
                y2,
                colors: isEmpty(colors) ? undefined : colors,
                filters,
                sorting: isEmpty(sorting) ? undefined : sorting,
            });
        });
    } else {
        const xPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.X,
        );
        const x: RecipeField[] | undefined = xPlaceholder?.items?.map(mapFieldToRecipeField);

        const yPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Y,
        );
        const y: RecipeField[] | undefined = yPlaceholder?.items?.map(mapFieldToRecipeField);

        const y2Placeholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Y2,
        );
        const y2: RecipeField[] | undefined = y2Placeholder?.items?.map(mapFieldToRecipeField);

        const colors: RecipeField[] | undefined = config.colors?.map(mapFieldToRecipeField);
        const split: RecipeField[] | undefined = config.segments?.map(mapFieldToRecipeField);

        const columnPlaceholder = config.visualization?.placeholders.find(
            (p) =>
                p.id === PlaceholderId.FlatTableColumns || p.id === PlaceholderId.PivotTableColumns,
        );
        const columns: RecipeField[] | undefined = columnPlaceholder?.items?.map((d) => {
            const bar = d?.barsSettings?.enabled
                ? {
                      colorType: d.barsSettings.colorSettings?.colorType ?? BarsColorType.Gradient,
                      palette: d.barsSettings.colorSettings?.settings?.palette,
                  }
                : undefined;
            return {
                ...mapFieldToRecipeField(d),
                bar,
            };
        });

        const rowsPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.PivotTableRows,
        );
        const rows: RecipeField[] | undefined = rowsPlaceholder?.items?.map(mapFieldToRecipeField);

        const measuresPlaceholder = config.visualization?.placeholders.find(
            (p) => p.id === PlaceholderId.Measures,
        );
        const measures: RecipeField[] | undefined =
            measuresPlaceholder?.items?.map(mapFieldToRecipeField);

        const sorting = config.sort?.map((d) => {
            return {
                ...mapFieldToRecipeField(d),
                direction: d.direction,
            } as SortingValue;
        });

        layers.push({
            type: config.visualization?.id as WizardRecipeType,
            x,
            y,
            y2,
            colors: isEmpty(colors) ? undefined : colors,
            columns,
            rows,
            measures,
            split: isEmpty(split) ? undefined : split,
            filters,
            sorting: isEmpty(sorting) ? undefined : sorting,
        });
    }

    return {
        datasetId: config.datasetsIds?.[0] ?? '',
        datasetUpdates: config.updates
            ?.map((item) => {
                switch (item.action) {
                    case 'add_field': {
                        return {
                            action: item.action,
                            field: {
                                title: item.field.title,
                                formula: item.field.formula,
                            },
                        };
                    }
                    case 'update_field': {
                        return {
                            action: item.action,
                            field: {
                                title: item.field.title,
                                default_value: item.field.default_value,
                            },
                        };
                    }
                }

                return null;
            })
            .filter(Boolean) as RecipeFieldUpdate[],
        layers,
    };
}
