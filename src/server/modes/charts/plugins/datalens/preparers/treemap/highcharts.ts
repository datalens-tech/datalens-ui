import {
    MINIMUM_FRACTION_DIGITS,
    isDateField,
    isHtmlField,
    isMarkdownField,
} from '../../../../../../../shared';
import type {WrappedMarkdown} from '../../../../../../../shared/utils/markdown';
import {wrapMarkdownValue} from '../../../../../../../shared/utils/markdown';
import {wrapHtml} from '../../../../../../../shared/utils/ui-sandbox';
import {
    mapAndColorizeHashTableByGradient,
    mapAndColorizeHashTableByPalette,
} from '../../utils/color-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    isGradientMode,
    isNumericalDataType,
} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

type TreemapItemName = string | null | WrappedMarkdown;

type TreemapItem = {
    id: string;
    name: TreemapItemName | TreemapItemName[];
    parent?: string;
    label?: string;
    value?: number;
    drillDownFilterValue?: string | null;
    color?: string;
    custom?: object;
};

export function prepareHighchartsTreemap({
    placeholders,
    resultData,
    colors,
    colorsConfig,
    idToTitle,
    idToDataType,
    ChartEditor,
}: PrepareFunctionArgs) {
    // Dimensions
    const d = placeholders[0].items;
    const dTypes = d.map((item) => item.data_type);
    const useMarkdown = d?.some(isMarkdownField);
    const useHtml = d?.some(isHtmlField);

    // Measures
    const m = placeholders[1].items;

    const color = colors[0];
    const colorFieldDataType = color ? idToDataType[color.guid] : null;

    const gradientMode =
        color &&
        colorFieldDataType &&
        isGradientMode({colorField: color, colorFieldDataType, colorsConfig});

    const {data, order} = resultData;

    let treemap: TreemapItem[] = [];
    const treemapIds: string[] = [];
    const hashTable: Record<string, {value: string | null; label: string}> = {};
    const valuesForColorData: Record<string, number> & {colorGuid?: string} = {};
    const isFloat = m[0] && m[0].data_type === 'float';
    let multimeasure = false;
    let measureNamesLevel: number;
    let colorData: Record<string, {backgroundColor: string}> = {};

    if (color) {
        // We make the property non-enumerable so that it does not participate in the formation of the palette
        Object.defineProperty(valuesForColorData, 'colorGuid', {
            enumerable: false,
            value: color.guid,
        });
    }

    const measureNames = m.map((measureItem) => idToTitle[measureItem.guid]);

    // TODO: think about why. After all, you can put only one field in the measures (Size) (treemap.tsx)
    if (measureNames.length > 1) {
        multimeasure = true;

        d.some((item, level) => {
            if (item.type === 'PSEUDO') {
                measureNamesLevel = level;

                return true;
            } else {
                return false;
            }
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
        let lastDimensionItem: TreemapItem | undefined;
        d.forEach((item, level) => {
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

            const treemapItem: TreemapItem = {
                id: treemapId,
                name,
                drillDownFilterValue: value,
            };

            if (dPath.length) {
                treemapItem.parent = `id_${dPath.join('/')}`;
            }

            dPath.push(value);

            treemapItem.id = `id_${dPath.join('/')}`;

            if (level === d.length - 1) {
                lastDimensionItem = treemapItem;
            } else if (!treemapIds.includes(treemapItem.id)) {
                treemap.push(treemapItem);
                treemapIds.push(treemapItem.id);
            }
        });

        const key = `id_${dPath.join('/')}`;
        m.forEach((measureItem) => {
            const actualTitle = idToTitle[measureItem.guid];
            const i = findIndexInOrder(order, measureItem, actualTitle);
            const value = values[i];
            const label = chartKitFormatNumberWrapper(Number(value), {
                lang: 'ru',
                ...(measureItem.formatting ?? {precision: isFloat ? MINIMUM_FRACTION_DIGITS : 0}),
            });

            if (multimeasure) {
                const dPathSpecial = [...dPath];

                dPathSpecial.splice(measureNamesLevel, 0, actualTitle);

                const specialKey = `${dPathSpecial.join('/')}`;

                hashTable[specialKey] = {value: value, label};
            } else {
                hashTable[key] = {value: value, label};
            }

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
            } else if (useHtml) {
                name = dPath.map((item) => (item ? wrapHtml(item) : item));
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

            const colorDataValue = colorData[obj.id];
            if (colorDataValue) {
                item.color = colorDataValue.backgroundColor;
            }

            return item;
        });
    }

    let levels;

    if (d.length === 1) {
        levels = [
            {
                level: 1,
                borderWidth: 1,
            },
        ];
    } else if (d.length === 2) {
        levels = [
            {
                level: 1,
                borderWidth: 3,
            },
            {
                level: 2,
                borderWidth: 1,
            },
        ];
    } else {
        levels = [
            {
                level: 1,
                borderWidth: 5,
            },
            {
                level: 2,
                borderWidth: 3,
            },
            {
                level: 3,
                borderWidth: 1,
            },
        ];
    }

    if (useMarkdown) {
        ChartEditor.updateConfig({useMarkdown: true});
    }

    if (useHtml) {
        ChartEditor.updateConfig({useHtml: true});
    }

    const graphs = [
        {
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            allowTraversingTree: true,
            interactByLeaf: true,
            tooltip: {
                ...(isFloat && {valueDecimals: MINIMUM_FRACTION_DIGITS}),
            },
            dataLabels: {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                style: {
                    cursor: 'pointer',
                },
                ...((useMarkdown || useHtml) && {
                    useHTML: true,
                }),
            },
            levelIsConstant: false,
            levels,
            data: treemap,
        },
    ];

    return {graphs};
}
