import type {ChartData, FunnelSeries} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import {
    PlaceholderId,
    getFakeTitleOrTitle,
    getFormatOptions,
    isMeasureValue,
    isNumberField,
    isPseudoField,
} from '../../../../../../../shared';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import type {ColorValue} from '../../utils/color-helpers';
import {getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {
    chartKitFormatNumberWrapper,
    findIndexInOrder,
    isGradientMode,
} from '../../utils/misc-helpers';
import {getFormattedValue} from '../helpers/get-formatted-value';
import {getLegendColorScale} from '../helpers/legend';
import type {PrepareFunctionArgs} from '../types';

export function prepareFunnel({
    shared,
    idToTitle,
    idToDataType,
    resultData,
    placeholders,
    labels,
    colors,
    colorsConfig,
}: PrepareFunctionArgs): Partial<ChartData> {
    const {data, order} = resultData;
    const measures = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items ?? [];

    const colorItem = colors?.[0];
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

    let legend: ChartData['legend'] = {};

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
        legend = {
            enabled: true,
            type: 'continuous',
            colorScale,
        };
    } else {
        legend.enabled = series.data.length > 1;
    }

    return merge(getBaseChartConfig(shared), {
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
    });
}
