import {dateTimeUtc} from '@gravity-ui/date-utils';
import get from 'lodash/get';
import type {
    ExtendedExportingCsvOptions,
    GraphTooltipLine,
    HighchartsSeriesCustomObject,
} from 'shared';
import {ChartkitHandlers} from 'shared';

export const baseRenderFn = (value: unknown) => value;

export const ChartkitHandlersDict = {
    [ChartkitHandlers.DCMonitoringLabelFormatter]: DCMonitoringLabelFormatter,
    [ChartkitHandlers.WizardLabelFormatter]: wizardLabelFormatter,
    [ChartkitHandlers.WizardTooltipHeaderFormatter]: wizardGetHeaderTooltipFormatter,
    [ChartkitHandlers.WizardManageTooltipConfig]: wizardManageTooltipConfig,
    [ChartkitHandlers.WizardXAxisFormatter]: wizardXAxisFormatter,
    [ChartkitHandlers.WizardExportColumnNamesFormatter]: wizardExportColumnNamesFormatter,
    [ChartkitHandlers.WizardScatterTooltipFormatter]: wizardScatterTooltipFormatter,
    [ChartkitHandlers.WizardScatterYAxisLabelFormatter]: wizardScatterYAxisLabelFormatter,
    [ChartkitHandlers.WizardTreemapTooltipFormatter]: wizardTreemapTooltipFormatter,
    [ChartkitHandlers.WizardDatetimeAxisFormatter]: wizardDatetimeAxisFormatter,
};

function wizardDatetimeAxisFormatter(format: string) {
    return (point: Highcharts.AxisLabelsFormatterContextObject<number>) => {
        const dateTimeValue = dateTimeUtc({input: point.value});
        return dateTimeValue?.isValid() ? dateTimeValue.format(format) : point.value;
    };
}

function wizardManageTooltipConfig(config: {lines: GraphTooltipLine[]}) {
    const mappedLines = config.lines.map((row) => {
        let value: string | number = row.originalValue;

        if (typeof value === 'number') {
            if (Number.isInteger(value)) {
                const numberFormat = new Intl.NumberFormat('ru-RU', {
                    maximumFractionDigits: 0,
                    minimumFractionDigits: 0,
                });

                value = numberFormat.format(value);
            } else {
                const numberFormat = new Intl.NumberFormat('ru-RU', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                });

                value = numberFormat.format(value);
            }
        }

        return {
            ...row,
            value,
        };
    });

    return {
        ...config,
        lines: mappedLines,
        unsafe: true,
    };
}

function wizardLabelFormatter(this: any) {
    if (this.userOptions.formattedName) {
        return this.userOptions.formattedName;
    } else if (this.userOptions.legendTitle) {
        return this.userOptions.legendTitle;
    } else {
        return this.name;
    }
}

function wizardXAxisFormatter(point: Highcharts.AxisLabelsFormatterContextObject<number>) {
    return point.value;
}

function wizardGetHeaderTooltipFormatter(value: any) {
    return (xValue: any) => `${value}: ${xValue}`;
}

function wizardExportColumnNamesFormatter(item: Highcharts.Axis | Highcharts.Series, key?: string) {
    if (
        'custom' in item.userOptions &&
        (item.userOptions.custom as HighchartsSeriesCustomObject).segmentTitle
    ) {
        const {colorValue, shapeValue, legendTitle} = item.userOptions as any;
        const segmentTitle = (item.userOptions.custom as HighchartsSeriesCustomObject).segmentTitle;

        if (typeof colorValue !== 'undefined' || typeof shapeValue !== 'undefined') {
            return `${segmentTitle}: ${legendTitle}`;
        }

        return segmentTitle;
    }

    const chart = item.chart;
    const csvOptions = (chart.userOptions?.exporting?.csv || {}) as ExtendedExportingCsvOptions;
    const columnHeader = key
        ? csvOptions.custom?.columnHeaderMap?.[key]
        : csvOptions.custom?.categoryHeader;

    if (columnHeader?.title) {
        if (chart.series.length > 1 && 'name' in item && item.name) {
            return `${columnHeader.title}: ${item.name}`;
        }

        return columnHeader.title;
    }

    return false;
}

function DCMonitoringLabelFormatter(this: any) {
    const units = this.chart.series[0].userOptions.units;

    return `${Math.round(this.value * 100) / 100} ${units}`;
}

function wizardScatterTooltipFormatter(this: any) {
    const point = this;
    const seriesTooltipOptions = get(point, 'series.userOptions.custom.tooltipOptions', {});
    const {pointTitle, xTitle, yTitle, shapeTitle, colorTitle, sizeTitle} = seriesTooltipOptions;

    const result: string[] = [`${xTitle}: ${point.xLabel}`, `${yTitle}: ${point.yLabel}`];

    if (shapeTitle && shapeTitle !== colorTitle) {
        result.unshift(`${shapeTitle}: ${point.sLabel}`);
    }

    if (colorTitle) {
        result.unshift(`${colorTitle}: ${point.cLabel}`);
    }

    if (sizeTitle) {
        result.unshift(`${sizeTitle}: ${point.sizeLabel}`);
    }

    if (pointTitle) {
        result.unshift(`${pointTitle}: <b>${point.name}</b>`);
    }

    return result.join('<br/>');
}

function wizardTreemapTooltipFormatter(this: any) {
    const point = this;
    const name = Array.isArray(point.name) ? point.name.join('<br/>') : point.name;

    return `${name}<br/><b>${point.label}</b>`;
}

function wizardScatterYAxisLabelFormatter(
    ctx: Highcharts.AxisLabelsFormatterContextObject<number>,
) {
    let result = '';
    const value = ctx.value;
    const series = ctx.chart.userOptions.series;

    series?.some((s) => {
        const data = get(s, 'data', []) as Highcharts.Point[];

        if (data.length) {
            const point = data.find((somePoint) => somePoint.y === value);

            if (point) {
                result = point.yLabel;
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    });

    return result;
}
