import type {
    ChartData,
    TreemapSeries,
    TreemapSeriesData,
} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';
import orderBy from 'lodash/orderBy';

import type {
    ColumnExportSettings,
    SeriesExportSettings,
    WrappedMarkdown,
} from '../../../../../../../shared';
import {
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    isDateField,
    isMarkdownField,
} from '../../../../../../../shared';
import {wrapMarkdownValue} from '../../../../../../../shared/utils/markdown';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {
    mapAndColorizeHashTableByGradient,
    mapAndColorizeHashTableByPalette,
} from '../../utils/color-helpers';
import {getExportColumnSettings} from '../../utils/export-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

type TreemapItemName = string | null | WrappedMarkdown;
type ExtendedTreemapSeriesData = Omit<TreemapSeriesData, 'name'> & {
    name: TreemapItemName | TreemapItemName[];
    drillDownFilterValue: unknown;
    label?: string;
};

type ExtendedTreemapSeries = TreemapSeries & {
    custom?: {
        exportSettings?: SeriesExportSettings;
    };
};

export function prepareD3Treemap({
    shared,
    placeholders,
    resultData,
    colors,
    colorsConfig,
    idToTitle,
    idToDataType,
    ChartEditor,
}: PrepareFunctionArgs): Partial<ChartData> {
    const dimensions = placeholders.find((p) => p.id === PlaceholderId.Dimensions)?.items ?? [];
    const dTypes = dimensions.map((item) => item.data_type);
    const useMarkdown = dimensions?.some(isMarkdownField);

    const measures = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items ?? [];

    const color = colors[0];
    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const {data, order} = resultData;

    let treemap: ExtendedTreemapSeriesData[] = [];
    const treemapIds: string[] = [];
    const hashTable: Record<string, {value: string | null; label: string}> = {};
    const valuesForColorData: Record<string, number> & {colorGuid?: string} = {};
    const isFloat = measures[0] && measures[0].data_type === 'float';
    let colorData: Record<string, {backgroundColor: string}> = {};

    if (color) {
        // We make the property non-enumerable so that it does not participate in the formation of the palette
        Object.defineProperty(valuesForColorData, 'colorGuid', {
            enumerable: false,
            value: color.guid,
        });
    }

    data.forEach((values) => {
        let colorByDimension: string | null;
        if (color && color.type === 'DIMENSION') {
            const actualTitle = idToTitle[color.guid];
            const i = findIndexInOrder(order, color, actualTitle);
            const colorValue = values[i];

            colorByDimension = colorValue;
        }

        const dPath: (string | null)[] = [];
        let lastDimensionItem: ExtendedTreemapSeriesData | undefined;
        dimensions.forEach((item, level) => {
            if (item.type === 'PSEUDO') {
                return;
            }

            const actualTitle = idToTitle[item.guid];

            const i = findIndexInOrder(order, item, actualTitle);

            const rawValue = values[i];
            let value: string | null;

            if (isDateField({data_type: dTypes[level]})) {
                value = formatDate({
                    valueType: dTypes[level],
                    value: rawValue,
                    format: item.format,
                });
            } else if (isNumericalDataType(dTypes[level]) && item.formatting) {
                value = chartKitFormatNumberWrapper(rawValue as unknown as number, {
                    lang: 'ru',
                    ...item.formatting,
                });
            } else {
                value = rawValue;
            }

            const treemapId =
                dPath.length >= 1 ? `id_${dPath[0]}/${value}` : `id_${dPath.join()}${value}`;

            const name = isMarkdownField(item) ? wrapMarkdownValue(value as string) : value;

            const treemapItem: ExtendedTreemapSeriesData = {
                id: treemapId,
                name,
                drillDownFilterValue: value,
            };

            if (dPath.length) {
                treemapItem.parentId = `id_${dPath.join('/')}`;
            }

            dPath.push(value);

            treemapItem.id = `id_${dPath.join('/')}`;

            if (level === dimensions.length - 1) {
                lastDimensionItem = treemapItem;
            } else if (!treemapIds.includes(treemapItem.id)) {
                treemap.push(treemapItem);
                treemapIds.push(treemapItem.id);
            }
        });

        const key = `id_${dPath.join('/')}`;
        measures.forEach((measureItem) => {
            const actualTitle = idToTitle[measureItem.guid];
            const i = findIndexInOrder(order, measureItem, actualTitle);
            const value = values[i];
            const label = chartKitFormatNumberWrapper(Number(value), {
                lang: 'ru',
                ...(measureItem.formatting ?? {precision: isFloat ? MINIMUM_FRACTION_DIGITS : 0}),
            });

            hashTable[key] = {value: value, label};

            if (color) {
                if (gradientMode) {
                    const colorTitle = idToTitle[color.guid];
                    const i = findIndexInOrder(order, color, colorTitle);
                    const colorValue = values[i];

                    valuesForColorData[key] = colorValue as unknown as number;
                } else {
                    valuesForColorData[key] = colorByDimension as unknown as number;
                }
            }
        });

        if (lastDimensionItem) {
            lastDimensionItem.value = Number(hashTable[key]?.value);
            lastDimensionItem.label = hashTable[key]?.label;
            let name: any[] = dPath;
            if (useMarkdown) {
                name = dPath.map((item) => (item ? wrapMarkdownValue(item) : item));
            }
            lastDimensionItem.name = name as any;

            treemap.push(lastDimensionItem);
        }
    });

    if (color) {
        if (gradientMode) {
            colorData = mapAndColorizeHashTableByGradient(
                valuesForColorData,
                colorsConfig,
            ).colorData;
        } else {
            colorData = mapAndColorizeHashTableByPalette(valuesForColorData, colorsConfig);
        }

        treemap = treemap.map((obj) => {
            const item = {...obj};

            const colorDataValue = obj.id ? colorData[obj.id] : null;
            if (colorDataValue) {
                item.color = colorDataValue.backgroundColor;
            }

            return item;
        });
    }

    const dimensionsSize = dimensions.length;
    const maxPadding = 5;
    const levels: TreemapSeries['levels'] = new Array(dimensionsSize)
        .fill(null)
        .map((_, index) => ({
            index: index + 1,
            padding: Math.min(maxPadding, (dimensionsSize - index) * 2 - 1),
        }));

    if (useMarkdown) {
        ChartEditor.updateConfig({useMarkdown: true});
    }

    const exportSettingsCols = dimensions.map<ColumnExportSettings>((field, index) => {
        return getExportColumnSettings({path: `name.${index}`, field});
    });
    exportSettingsCols.push(getExportColumnSettings({path: `value`, field: measures[0]}));

    const series: ExtendedTreemapSeries = {
        type: 'treemap',
        name: '',
        layoutAlgorithm: 'squarify' as TreemapSeries['layoutAlgorithm'],
        dataLabels: {
            enabled: true,
            html: useMarkdown,
            style: {
                fontSize: '11px',
            },
        },
        levels,
        data: orderBy(treemap, (d) => d.value, 'desc') as TreemapSeriesData[],
        custom: {
            exportSettings: {
                columns: exportSettingsCols,
            },
        },
    };

    return merge(getBaseChartConfig(shared), {
        series: {
            data: [series],
        },
        legend: {
            enabled: false,
        },
    });
}
