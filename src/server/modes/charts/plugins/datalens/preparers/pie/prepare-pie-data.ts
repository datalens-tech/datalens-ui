import type {ExtendedSeriesLineOptions, WrappedHTML} from '../../../../../../../shared';
import {
    DATASET_FIELD_TYPES,
    MINIMUM_FRACTION_DIGITS,
    PlaceholderId,
    getDistinctValue,
    getFakeTitleOrTitle,
    isFieldHierarchy,
    isHtmlField,
    isMarkdownField,
    isMarkupField,
    isMeasureValue,
    isNumberField,
    isPseudoField,
    wrapMarkupValue,
} from '../../../../../../../shared';
import {wrapMarkdownValue} from '../../../../../../../shared/utils/markdown';
import {wrapHtml} from '../../../../../../../shared/utils/ui-sandbox';
import type {ChartColorsConfig} from '../../types';
import type {ColorValue} from '../../utils/color-helpers';
import {getColorsByMeasureField, getThresholdValues} from '../../utils/color-helpers';
import {getColor, getMountedColor} from '../../utils/constants';
import {findIndexInOrder} from '../../utils/misc-helpers';
import {addActionParamValue} from '../helpers/action-params';
import type {PiePoint, PrepareFunctionArgs} from '../types';

import {getFormattedValue, isColoringByMeasure} from './utils';

export type PieConfig = {
    name: string;
    dataLabels: any;
    tooltip: any;
    data?: (PiePoint & ExtendedSeriesLineOptions)[];
    showInLegend?: boolean;
    pointConflict?: boolean;
};

function mapAndColorizePieByGradient(
    points: (PiePoint & ExtendedSeriesLineOptions)[],
    colorsConfig: ChartColorsConfig,
) {
    const colorValues = points.map((point) => Number(point.colorValue) as ColorValue);

    const gradientThresholdValues = getThresholdValues(colorsConfig, colorValues);
    const gradientColors = getColorsByMeasureField({
        values: colorValues,
        colorsConfig,
        gradientThresholdValues,
    });

    points.forEach((point) => {
        const pointColorValue = Number(point.colorValue);

        if (gradientColors[pointColorValue]) {
            point.color = gradientColors[pointColorValue];
        }
    });

    return points;
}

function getPieSegmentColor({
    item,
    colorsConfig,
    usedColors,
}: {
    item: PiePoint;
    colorsConfig: ChartColorsConfig;
    usedColors: Map<PiePoint['colorValue'], string>;
}) {
    if (!usedColors.has(item.colorValue)) {
        usedColors.set(item.colorValue, getColor(usedColors.size, colorsConfig.colors));
    }

    if (
        colorsConfig &&
        colorsConfig.mountedColors &&
        (item.colorGuid === colorsConfig.fieldGuid || colorsConfig.coloredByMeasure) &&
        item.colorValue &&
        colorsConfig.mountedColors[item.colorValue]
    ) {
        return getMountedColor(colorsConfig, item.colorValue);
    }

    return usedColors.get(item.colorValue);
}

// eslint-disable-next-line complexity
export function preparePieData(args: PrepareFunctionArgs) {
    const {
        placeholders,
        resultData,
        sort,
        labels,
        colorsConfig,
        idToTitle,
        idToDataType,
        ChartEditor,
        disableDefaultSorting = false,
        shared,
    } = args;
    const {data, order, totals} = resultData;
    const widgetConfig = ChartEditor.getWidgetConfig();

    const measure = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items[0];
    let colorField = placeholders.find((p) => p.id === PlaceholderId.Colors)?.items[0];
    if (isFieldHierarchy(colorField)) {
        const drillDownLevel = shared.sharedData?.drillDownData?.level || 0;
        colorField = colorField.fields[Math.min(drillDownLevel, colorField.fields.length - 1)];
    }

    if (colorField) {
        colorField = {
            ...colorField,
            data_type: idToDataType[colorField.guid],
        };
    }
    const isHtmlColor = isHtmlField(colorField);

    let dimensionField = placeholders.find((p) => p.id === PlaceholderId.Dimensions)?.items[0];
    if (dimensionField) {
        dimensionField = {
            ...dimensionField,
            data_type: idToDataType[dimensionField.guid],
        };
    }
    const isHtmlDimension = isHtmlField(dimensionField);

    if (!measure) {
        return {graphs: []};
    }

    const colorIndex = colorField
        ? findIndexInOrder(order, colorField, idToTitle[colorField.guid])
        : -1;
    const shouldUseGradient = isColoringByMeasure(args);
    const dimensionIndex = dimensionField
        ? findIndexInOrder(order, dimensionField, idToTitle[dimensionField.guid])
        : -1;

    const labelItem = labels?.[0];
    const labelField = labelItem
        ? {...labelItem, data_type: idToDataType[labelItem.guid]}
        : labelItem;
    const labelIndex = labelField
        ? findIndexInOrder(order, labelField, idToTitle[labelField.guid])
        : -1;
    const isMarkdownLabel = isMarkdownField(labelItem);
    const isMarkupLabel = isMarkupField(labelItem);
    const isHtmlLabel = isHtmlField(labelItem);

    const measureIndex = findIndexInOrder(order, measure, idToTitle[measure.guid]);
    const measureDataType = idToDataType[measure.guid] || measure.data_type;

    if (measureIndex === -1) {
        return {graphs: []};
    }

    const title = idToTitle[measure.guid];
    const name =
        title.includes(measure.guid) && measure.originalTitle ? measure.originalTitle : title;
    const measureFormatting = measure?.formatting;
    const labelFormatting = isMeasureValue(labelField) ? measureFormatting : labelField?.formatting;
    const labelFinalDataType = isPseudoField(labelField) ? measureDataType : labelField?.data_type;

    const pie: PieConfig = {
        name,
        tooltip:
            measureFormatting && Object.keys(measureFormatting).length
                ? {
                      chartKitFormatting: true,
                      chartKitPrecision: measureFormatting.precision,
                      chartKitPrefix: measureFormatting.prefix,
                      chartKitPostfix: measureFormatting.postfix,
                      chartKitUnit: measureFormatting.unit,
                      chartKitFormat: measureFormatting.format,
                      chartKitLabelMode: measureFormatting.labelMode,
                      chartKitShowRankDelimiter: measureFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision: measureDataType === 'float' ? MINIMUM_FRACTION_DIGITS : 0,
                  },
        dataLabels: {
            ...(labelFormatting && Object.keys(labelFormatting).length
                ? {
                      // need to reset dataLabels.format to use dataLabels.formatter
                      format: null,
                      chartKitFormatting: true,
                      chartKitPrecision: labelFormatting.precision,
                      chartKitPrefix: labelFormatting.prefix,
                      chartKitPostfix: labelFormatting.postfix,
                      chartKitUnit: labelFormatting.unit,
                      chartKitLabelMode: labelFormatting.labelMode,
                      chartKitFormat: labelFormatting.format,
                      chartKitShowRankDelimiter: labelFormatting.showRankDelimiter,
                  }
                : {
                      chartKitFormatting: true,
                      chartKitPrecision:
                          labelFinalDataType === DATASET_FIELD_TYPES.FLOAT
                              ? MINIMUM_FRACTION_DIGITS
                              : 0,
                  }),
            useHTML: (isMarkdownLabel || isMarkupLabel || isHtmlLabel) ?? undefined,
        },
    };

    // eslint-disable-next-line complexity
    const pieData = data.reduce((acc, values) => {
        const dimensionValue = values[dimensionIndex];
        const measureValue = values[measureIndex];
        const colorFieldValue = values[colorIndex];
        const labelValue = values[labelIndex];

        let colorValue: string | number = name;
        const legendParts: string[] = [];
        const formattedNameParts: Array<string> = [];

        if (colorField && typeof colorFieldValue !== 'undefined') {
            if (shouldUseGradient) {
                colorValue = Number(colorFieldValue);
            } else {
                colorValue = getDistinctValue(colorFieldValue);
                legendParts.push(String(colorFieldValue));
                formattedNameParts.push(String(getFormattedValue(colorFieldValue, colorField)));
            }
        }

        if (dimensionField) {
            legendParts.push(String(dimensionValue));
            formattedNameParts.push(String(getFormattedValue(dimensionValue, dimensionField)));
        }

        const pointName = legendParts.length
            ? legendParts.join(': ')
            : getFakeTitleOrTitle(measure);
        const drillDownFilterValue = pointName;
        const shouldWrapPointName = isHtmlColor || isHtmlDimension;

        let formattedName: string | WrappedHTML = formattedNameParts.join(': ');
        if (isHtmlColor || isHtmlDimension) {
            formattedName = wrapHtml(formattedName);
        }

        const point: PiePoint = {
            name: shouldWrapPointName ? wrapHtml(pointName) : pointName,
            formattedName,
            drillDownFilterValue,
            y: Number(measureValue),
            colorGuid: colorField?.guid,
            colorValue,
        };

        if (labelField) {
            if (isPseudoField(labelField)) {
                point.label = isMeasureValue(labelField) ? Number(measureValue) : formattedName;
            } else if (isNumberField(labelField)) {
                // The value will be formatted using dataLabels.chartKitFormatting
                point.label = Number(labelValue);
            } else if (labelValue && isMarkdownLabel) {
                point.label = wrapMarkdownValue(labelValue);
            } else if (labelValue && isMarkupLabel) {
                point.label = wrapMarkupValue(labelValue);
            } else if (labelValue && isHtmlLabel) {
                point.label = wrapHtml(labelValue);
            } else {
                point.label = getFormattedValue(labelValue, {
                    ...labelField,
                    data_type: idToDataType[labelField.guid],
                });
            }
        }

        if (widgetConfig?.actionParams?.enable) {
            const actionParams: Record<string, any> = {};
            addActionParamValue(actionParams, dimensionField, dimensionValue);
            addActionParamValue(actionParams, colorField, colorValue);

            point.custom = {
                actionParams,
            };
        }

        if (acc.get(pointName)) {
            pie.pointConflict = true;
        }

        acc.set(pointName, point);

        return acc;
    }, new Map<string, PiePoint>());

    pie.data = Array.from(pieData.values())
        // We remove negative values, since pie does not know how to display them
        .filter((point) => point.y > 0) as (PiePoint & ExtendedSeriesLineOptions)[];

    if (!disableDefaultSorting && (!sort || !sort.length)) {
        pie.data.sort((a, b) => {
            return a.y > b.y ? -1 : a.y < b.y ? 1 : 0;
        });
    }

    if (shouldUseGradient) {
        pie.data = mapAndColorizePieByGradient(pie.data, colorsConfig);
    } else {
        const usedColors = new Map();
        pie.data.forEach((d) => {
            d.color = getPieSegmentColor({item: d, colorsConfig, usedColors});
        });
    }

    if (isMarkdownLabel) {
        ChartEditor.updateConfig({useMarkdown: true});
    }

    if (isMarkupLabel) {
        ChartEditor.updateConfig({useMarkup: true});
    }

    if (isHtmlColor || isHtmlDimension || [labelField].some(isHtmlField)) {
        ChartEditor.updateConfig({useHtml: true});
    }

    return {
        graphs: [pie],
        totals: totals.find((value) => value),
        label: labelField,
        measure,
        color: colorField,
        dimension: dimensionField,
    };
}

export default preparePieData;
