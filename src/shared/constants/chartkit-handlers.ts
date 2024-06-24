import get from 'lodash/get';

import type {ExtendedExportingCsvOptions, HighchartsSeriesCustomObject} from '../types';

export enum ChartkitHandlers {
    DCMonitoringLabelFormatter = 'dc-monitoring-label-formatter',
    WizardLabelFormatter = 'wizard-label-formatter',
    WizardTooltipHeaderFormatter = 'wizard-tooltip-header-formatter',
    WizardManageTooltipConfig = 'wizard-manage-tooltip-config',
    WizardXAxisFormatter = 'wizard-x-axis-formatter',
    WizardExportColumnNamesFormatter = 'wizard-export-column-names-formatter',
    WizardScatterTooltipFormatter = 'wizard-scatter-tooltip-formatter',
}

export const ChartkitHandlersDict = {
    [ChartkitHandlers.DCMonitoringLabelFormatter]: DCMonitoringLabelFormatter,
    [ChartkitHandlers.WizardLabelFormatter]: wizardLabelFormatter,
    [ChartkitHandlers.WizardTooltipHeaderFormatter]: wizardGetHeaderTooltipFormatter,
    [ChartkitHandlers.WizardManageTooltipConfig]: wizardManageTooltipConfig,
    [ChartkitHandlers.WizardXAxisFormatter]: wizardXAxisFormatter,
    [ChartkitHandlers.WizardExportColumnNamesFormatter]: wizardExportColumnNamesFormatter,
    [ChartkitHandlers.WizardScatterTooltipFormatter]: wizardScatterTooltipFormatter,
};

export interface GraphTooltipLine {
    originalValue: number;
    seriesName: string;
    value: string;
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

export const WRAPPED_HTML_KEY = '__wrappedHTML__';
