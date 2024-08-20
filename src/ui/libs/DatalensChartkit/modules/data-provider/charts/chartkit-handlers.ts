import get from 'lodash/get';
import type {
    ExtendedExportingCsvOptions,
    GraphTooltipLine,
    HighchartsSeriesCustomObject,
} from 'shared';
import {ChartkitHandlers} from 'shared';

type RenderMarkdown = (value: string) => string;

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
    [ChartkitHandlers.WizardDataLabelMarkdownFormatter]: wizardDataLabelMarkdownFormatter,
    [ChartkitHandlers.WizardAxisLabelMarkdownFormatter]: wizardAxisLabelMarkdownFormatter,
};

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

function wizardScatterTooltipFormatter(this: any, renderMarkdown?: RenderMarkdown) {
    const point = this;
    const renderItem = renderMarkdown ?? baseRenderFn;
    const seriesTooltipOptions = get(point, 'series.userOptions.custom.tooltipOptions', {});
    const {pointTitle, xTitle, yTitle, shapeTitle, colorTitle, sizeTitle} = seriesTooltipOptions;

    const result: string[] = [
        `${xTitle}: ${renderItem(point.xLabel)}`,
        `${yTitle}: ${renderItem(point.yLabel)}`,
    ];

    if (shapeTitle && shapeTitle !== colorTitle) {
        result.unshift(`${shapeTitle}: ${renderItem(point.sLabel)}`);
    }

    if (colorTitle) {
        result.unshift(`${colorTitle}: ${renderItem(point.cLabel)}`);
    }

    if (sizeTitle) {
        result.unshift(`${sizeTitle}: ${renderItem(point.sizeLabel)}`);
    }

    if (pointTitle) {
        result.unshift(`${pointTitle}: <b>${renderItem(point.name)}</b>`);
    }

    return result.join('<br/>');
}

function wizardTreemapTooltipFormatter(
    this: any,
    _tooltip: unknown,
    renderMarkdown: RenderMarkdown,
) {
    const point = this;
    return `${renderMarkdown(point.name)}<br/><b>${point.label}</b>`;
}

function wizardDataLabelMarkdownFormatter(
    this: any,
    _options: unknown,
    renderMarkdown: RenderMarkdown,
) {
    return renderMarkdown(this.point.name);
}

function wizardAxisLabelMarkdownFormatter(this: any, renderMarkdown: RenderMarkdown) {
    return renderMarkdown(this.value);
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
