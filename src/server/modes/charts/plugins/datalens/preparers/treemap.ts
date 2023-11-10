import escape from 'lodash/escape';

import {
    Feature,
    MINIMUM_FRACTION_DIGITS,
    isDateField,
    isEnabledServerFeature,
} from '../../../../../../shared';
import {registry} from '../../../../../registry';
import {
    mapAndColorizeHashTableByDimension,
    mapAndColorizeHashTableByMeasure,
} from '../utils/color-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    formatDate,
    isNumericalDataType,
} from '../utils/misc-helpers';

import {PrepareFunctionArgs} from './types';

type TreemapItem = {
    id: string;
    name: string | null;
    parent?: string;
    label?: string;
    value?: number;
    drillDownFilterValue?: string | null;
    color?: string;
    custom?: object;
};

function prepareTreemap({
    placeholders,
    resultData,
    colors,
    colorsConfig,
    idToTitle,
}: PrepareFunctionArgs) {
    const app = registry.getApp();
    // Measurements
    const d = placeholders[0].items;
    const dTypes = d.map((item) => item.data_type);

    // Indicators
    const m = placeholders[1].items;

    const c = colors[0];

    const {data, order} = resultData;

    let treemap: TreemapItem[] = [];
    const treemapIds: string[] = [];
    const hashTable: Record<string, {value: string | null; label: string}> = {};
    const valuesForColorData: Record<string, number> & {colorGuid?: string} = {};
    const isFloat = m[0] && m[0].data_type === 'float';
    const shouldEscapeUserValue = isEnabledServerFeature(
        app.nodekit.ctx,
        Feature.EscapeUserHtmlInDefaultHcTooltip,
    );
    let multimeasure = false;
    let measureNamesLevel: number;
    let colorData: Record<string, {backgroundColor: string}> = {};

    if (c) {
        // we make the property non-enumerable so that it does not participate in the formation of the palette
        Object.defineProperty(valuesForColorData, 'colorGuid', {
            enumerable: false,
            value: c.guid,
        });
    }

    const measureNames = m.map((measureItem) => idToTitle[measureItem.guid]);
    // TODO: think about why. After all, you can put only one field in the indicators (Size) (treemap.tsx)
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
        if (c && c.type === 'DIMENSION') {
            const actualTitle = idToTitle[c.guid];
            const i = findIndexInOrder(order, c, actualTitle);
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
                value = rawValue && shouldEscapeUserValue ? escape(rawValue as string) : rawValue;
            }

            const treemapId =
                dPath.length >= 1 ? `id_${dPath[0]}/${value}` : `id_${dPath.join()}${value}`;

            const treemapItem: TreemapItem = {
                id: treemapId,
                name: value,
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

            if (c) {
                if (c.type === 'MEASURE') {
                    const colorTitle = idToTitle[c.guid];
                    const i = findIndexInOrder(order, c, colorTitle);
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
            lastDimensionItem.name = dPath.join('<br/>');

            treemap.push(lastDimensionItem);
        }
    });

    if (c) {
        if (c.type === 'MEASURE') {
            colorData = mapAndColorizeHashTableByMeasure(
                valuesForColorData,
                colorsConfig,
            ).colorData;
        } else {
            colorData = mapAndColorizeHashTableByDimension(valuesForColorData, colorsConfig);
        }

        treemap = treemap.map((obj) => {
            const item = {...obj};

            const color = colorData[obj.id];
            if (color) {
                item.color = color.backgroundColor;
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

    const graphs = [
        {
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            allowTraversingTree: true,
            interactByLeaf: true,
            tooltip: {
                pointFormat: '{point.name}<br/><b>{point.label}</b>',
                ...(isFloat && {valueDecimals: MINIMUM_FRACTION_DIGITS}),
            },
            dataLabels: {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                style: {
                    cursor: 'pointer',
                },
            },
            levelIsConstant: false,
            levels,
            data: treemap,
        },
    ];

    return {graphs};
}

export default prepareTreemap;
