import type {ChartData, FunnelSeries} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import {
    PlaceholderId,
    WizardVisualizationId,
    getFakeTitleOrTitle,
    getFormatOptions,
    isMeasureName,
    isMeasureValue,
    isNumberField,
    isPseudoField,
} from '../../../../../../../shared';
import {getColorsSettings} from '../../../helpers/color-palettes';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import type {ColorValue} from '../../utils/color-helpers';
import {getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {getColor, getMountedColor} from '../../utils/constants';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    isGradientMode,
} from '../../utils/misc-helpers';
import {getFormattedValue} from '../helpers/get-formatted-value';
import {getLegendColorScale} from '../helpers/legend';
import type {PrepareFunctionArgs} from '../types';

function getSegmentColor({
    colorValue,
    usedColors,
    colors,
    mountedColors,
}: {
    colorValue: string | undefined;
    usedColors: Map<any, string>;
    colors: string[];
    mountedColors: Record<string, string>;
}) {
    if (!usedColors.has(colorValue)) {
        usedColors.set(colorValue, getColor(usedColors.size, colors));
    }

    if (colorValue && mountedColors[colorValue]) {
        return getMountedColor({
            mountedColors,
            colors,
            value: colorValue,
        });
    }

    return usedColors.get(colorValue);
}

export function prepareFunnel({
    shared,
    idToTitle,
    idToDataType,
    resultData,
    placeholders,
    labels,
    colors: colorItems,
    colorsConfig,
    defaultColorPaletteId,
}: PrepareFunctionArgs): Partial<ChartData> {
    const {data, order} = resultData;
    const measures = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items ?? [];

    const colorItem = colorItems?.[0];
    const colorField = colorItem
        ? {...colorItem, data_type: idToDataType[colorItem.guid]}
        : colorItem;
    const colorIndex = colorField
        ? findIndexInOrder(order, colorField, idToTitle[colorField.guid])
        : -1;

    const labelItem = labels?.[0];
    const labelField = labelItem
        ? {...labelItem, data_type: idToDataType[labelItem.guid]}
        : labelItem;
    const labelIndex = labelField
        ? findIndexInOrder(order, labelField, idToTitle[labelField.guid])
        : -1;

    const series: FunnelSeries = {
        type: 'funnel',
        name: '',
        data: [],
        dataLabels: {
            enabled: Boolean(labelItem),
        },
    };

    data.forEach((values) => {
        measures.forEach((measureItem) => {
            const actualTitle = idToTitle[measureItem.guid];
            const i = findIndexInOrder(order, measureItem, actualTitle);
            const _measureValue = values[i];
            if (_measureValue === null) {
                return;
            }

            const measureValue = Number(_measureValue);
            const measureName = getFakeTitleOrTitle(measureItem);

            let colorValue;
            if (isMeasureValue(colorField)) {
                colorValue = measureValue;
            } else if (isNumberField(colorField)) {
                colorValue = values[colorIndex];
            }

            let labelValue;
            if (isPseudoField(labelField)) {
                labelValue = isMeasureValue(labelField)
                    ? chartKitFormatNumberWrapper(measureValue, {
                          lang: 'ru',
                          ...getFormatOptions(measureItem),
                      })
                    : measureName;
            } else {
                labelValue = getFormattedValue(labelField, values[labelIndex]);
            }

            series.data.push({
                value: Number(measureValue),
                name: measureName,
                label: labelValue as string | undefined,
                custom: {
                    colorValue: colorValue === null ? null : Number(colorValue),
                },
            });
        });
    });

    const isColoringByMeasure = isGradientMode({
        colorField: colorField,
        colorFieldDataType: colorField?.data_type,
        colorsConfig,
    });

    const legend: ChartData['legend'] = {
        enabled: shared?.extraSettings?.legendMode !== 'hide',
    };

    if (isColoringByMeasure) {
        const points = series.data.map((d) => ({colorValue: d.custom.colorValue as unknown}));
        const colorValues = points.map((p) => p.colorValue) as ColorValue[];

        const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
        const gradientColors = getColorsByMeasureField({
            values: colorValues,
            colorsConfig,
            gradientThresholdValues,
        });

        series.data.forEach((d) => {
            const pointColorValue = Number(d.custom.colorValue);

            if (gradientColors[pointColorValue]) {
                // eslint-disable-next-line no-param-reassign
                d.color = gradientColors[pointColorValue];
            }
        });

        const colorScale = getLegendColorScale({
            colorsConfig,
            points,
        });

        Object.assign(legend, {
            type: 'continuous',
            colorScale,
        });
    } else if (isMeasureName(colorItem)) {
        const {mountedColors, colors} = getColorsSettings({
            field: colorField,
            colorsConfig: colorsConfig,
            defaultColorPaletteId,
            availablePalettes: colorsConfig.availablePalettes,
            customColorPalettes: colorsConfig.loadedColorPalettes,
        });

        const usedColors = new Map();
        series.data.forEach((d) => {
            d.color = getSegmentColor({
                colorValue: d.name,
                colors,
                usedColors,
                mountedColors,
            });
        });
    }

    return merge(
        getBaseChartConfig({
            shared,
            visualization: {placeholders, id: WizardVisualizationId.Funnel},
        }),
        {
            series: {
                data: [series],
            },
            legend,
            chart: {
                zoom: {enabled: false},
                margin: {
                    left: 20,
                    right: 20,
                },
            },
        },
    );
}
