import escape from 'lodash/escape';

import type {
    DATASET_FIELD_TYPES,
    ServerChartsConfig,
    ServerPlaceholder,
} from '../../../../../shared';
import {
    AxisLabelFormatMode,
    ChartkitHandlers,
    Feature,
    LabelsPositions,
    LegendDisplayMode,
    PlaceholderId,
    VISUALIZATIONS_WITH_LABELS_POSITION,
    getFakeTitleOrTitle,
    getIsNavigatorEnabled,
    isDateField,
    isEnabledServerFeature,
} from '../../../../../shared';
import {registry} from '../../../../registry';

import type {IgnoreProps} from './utils/axis-helpers';
import {applyPlaceholderSettingsToAxis} from './utils/axis-helpers';
import {mapChartsConfigToServerConfig} from './utils/config-helpers';
import {getFieldTitle, isNumericalDataType, log} from './utils/misc-helpers';

type ExtendedHighchartsLegendOptions = Omit<Highcharts.LegendOptions, 'labelFormatter'> & {
    labelFormatter?:
        | typeof ChartkitHandlers.WizardLabelFormatter
        | Highcharts.LegendOptions['labelFormatter'];
};

type ExtendedHighchartsOptions = Omit<Highcharts.Options, 'legend'> & {
    legend?: ExtendedHighchartsLegendOptions;
};

// eslint-disable-next-line complexity
export const buildHighchartsConfig = (
    ...options: [{shared: ServerChartsConfig} | ServerChartsConfig]
) => {
    const app = registry.getApp();
    let shared: ServerChartsConfig;

    if ('shared' in options[0]) {
        shared = options[0].shared;
    } else {
        shared = options[0];
    }

    shared = mapChartsConfigToServerConfig(shared);

    if (
        ['geolayer', 'geopoint', 'geopolygon', 'heatmap', 'polyline'].includes(
            shared.visualization.id,
        )
    ) {
        // center and zoom are specified as the default value if bounds does not arrive
        // if bounds comes, then center and zoom are ignored
        return {
            state: {
                center: [55.76, 37.64],
                zoom: 8,
                controls: ['zoomControl'],
                behaviors: ['drag', 'scrollZoom', 'multiTouch'],
            },
            options: {},
        };
    }

    const tooltip = {};
    let legend: ExtendedHighchartsLegendOptions = {};
    let colorAxis: Highcharts.Options['colorAxis'];

    let xAxis: Highcharts.Options['xAxis'] = {
        endOnTick: false,
    };

    let yAxis: Highcharts.Options['yAxis'] = {};

    const chart: Highcharts.ChartOptions = {
        type: shared.visualization.highchartsId || shared.visualization.id,
        zoomType: 'x',
    };

    if (shared.visualization.id === 'combined-chart') {
        chart.type = '';
    }

    const plotOptions: Highcharts.PlotOptions = {};

    // By default, ChartKit enables navigator when there is a highstock object in config
    const navigator: Highcharts.Options['navigator'] = {
        enabled: false,
    };

    const axisWithAppliedSettings = applyCommonAxisSettings({shared, xAxis, yAxis});
    xAxis = axisWithAppliedSettings.xAxis;
    yAxis = axisWithAppliedSettings.yAxis;

    // We apply settings that are unique for each type of visualization

    const visualizationsIds = [shared.visualization.id].concat(
        (shared.visualization.layers || []).map((layer) => layer.id),
    );

    visualizationsIds.forEach((visualizationId) => {
        switch (visualizationId) {
            case 'line': {
                chart.zoomType = 'xy';
                legend.symbolWidth = 38;
                break;
            }
            case 'column':
            case 'column100p':
            case 'bar':
            case 'bar100p':
            case 'combined-chart': {
                chart.zoomType = 'xy';

                legend.labelFormatter = ChartkitHandlers.WizardLabelFormatter;
                break;
            }
        }

        extendPlotOptions({visualizationId: shared.visualization.id, plotOptions});

        shared.visualization.layers?.forEach((layer) => {
            extendPlotOptions({visualizationId: layer.id, plotOptions});
        });
    });

    if (shared.visualization.id === 'scatter') {
        const placeholders = shared.visualization.placeholders;

        plotOptions.series = {turboThreshold: 100000};

        const xField = placeholders[0].items[0];
        const yField = placeholders[1].items[0];
        const pointField = placeholders[2].items[0];
        const colorField = shared.colors[0];
        const shapeField = shared.shapes?.[0];
        const sizeField = placeholders.find((pl) => pl.id === PlaceholderId.Size)?.items[0];

        let xTitle = getFieldTitle(xField);
        let yTitle = getFieldTitle(yField);
        let pointTitle = getFakeTitleOrTitle(pointField);
        let colorTitle = getFieldTitle(colorField);
        let shapeTitle = getFieldTitle(shapeField);
        let sizeTitle = getFieldTitle(sizeField);

        if (isEnabledServerFeature(app.nodekit.ctx, Feature.EscapeUserHtmlInDefaultHcTooltip)) {
            xTitle = escape(xTitle);
            yTitle = escape(yTitle);
            pointTitle = escape(pointTitle);
            colorTitle = escape(colorTitle);
            shapeTitle = escape(shapeTitle);
            sizeTitle = escape(sizeTitle);
        }

        plotOptions.scatter = {
            tooltip: {},
        };

        if (plotOptions.scatter.tooltip) {
            if (pointTitle) {
                plotOptions.scatter.tooltip.headerFormat = `${pointTitle}: <b>{point.key}</b><br>`;
            } else {
                plotOptions.scatter.tooltip.headerFormat = '';
            }

            const lines = [`${xTitle}: {point.xLabel}`, `${yTitle}: {point.yLabel}`];

            if (shapeTitle && shapeTitle !== colorTitle) {
                lines.unshift(`${shapeTitle}: {point.sLabel}`);
            }

            if (colorTitle) {
                lines.unshift(`${colorTitle}: {point.cLabel}`);
            }

            if (sizeTitle) {
                lines.unshift(`${sizeTitle}: {point.sizeLabel}`);
            }

            plotOptions.scatter.tooltip.pointFormat = lines.join('<br>');
        }

        chart.zoomType = 'xy';

        const xPlaceholder = shared.visualization.placeholders.find(
            (placeholder) => placeholder.id === 'x',
        );
        if (xPlaceholder && xPlaceholder.items.length) {
            const xItem = xPlaceholder.items[0];

            if (isDateField(xItem)) {
                (xAxis as Highcharts.XAxisOptions).type = 'datetime';
            }
        }

        if (!Array.isArray(yAxis)) {
            yAxis.labels = {...(yAxis.labels || {})};

            const yPlaceholder = shared.visualization.placeholders.find(
                (placeholder) => placeholder.id === 'y',
            );
            if (yPlaceholder && yPlaceholder.items.length) {
                const yItem = yPlaceholder.items[0];

                if (isDateField(yItem)) {
                    yAxis.type = 'datetime';
                }

                if (
                    !isNumericalDataType(yItem.data_type as DATASET_FIELD_TYPES) &&
                    !isDateField(yItem) &&
                    yPlaceholder.settings?.axisFormatMode !== AxisLabelFormatMode.ByField
                ) {
                    // A special formatter that returns text labels on the Y axis
                    yAxis.labels.formatter = function () {
                        let result = '';
                        const value = this.value;
                        this.chart.series.some((serial) => {
                            const data = serial.data;

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
                    };
                }
            }
        }
    }

    if (shared.visualization.id === 'treemap') {
        chart.zoomType = undefined;
    }

    if (shared.extraSettings?.legendMode === LegendDisplayMode.Hide) {
        legend = {
            enabled: false,
        };
    }

    if (
        shared.extraSettings?.labelsPosition &&
        visualizationsIds.some((id) => VISUALIZATIONS_WITH_LABELS_POSITION.has(id))
    ) {
        plotOptions.series = {
            ...plotOptions.series,
            dataLabels: {
                ...plotOptions.series?.dataLabels,
                inside: shared.extraSettings?.labelsPosition !== LabelsPositions.Outside,
            },
        };
    }

    const allowOverlap = shared.extraSettings?.overlap === 'on';

    plotOptions.series = {
        ...plotOptions.series,
        dataGrouping: {
            ...plotOptions.series?.dataGrouping,
            enabled: false,
        },
        dataLabels: {
            ...plotOptions.series?.dataLabels,
            allowOverlap,
        },
    };

    if (getIsNavigatorEnabled(shared)) {
        navigator.enabled = true;
        const navigatorSeries: {
            type: string | undefined;
            stacking?: string;
        } = {
            type: chart.type,
        };
        switch (shared.visualization.id) {
            case 'area':
                navigatorSeries.stacking = 'normal';
                break;
            case 'area100p':
                navigatorSeries.stacking = 'percent';
                break;
            default:
                break;
        }
        navigator.series = navigatorSeries;
    }

    const result: ExtendedHighchartsOptions = {
        chart,
        legend,
        xAxis,
        yAxis,
        tooltip,
        colorAxis,
        plotOptions,
        // https://api.highcharts.com/highstock/navigator.series
        // Option navigator.series.dataLabels.enabled = false does not work (highcharts v8.2.2)
        // The documentation says that the series between the chart and the navigator are fumbling, and apparently,
        // because of this, there is a problem when trying to hide dataLabels, because they are marked in the series
        navigator: {
            series: {
                dataLabels: {color: 'transparent'},
                fillOpacity: 0.15,
            },
        },
    };

    log('HIGHCHARTS:');
    log(result);

    return result;
};

type ApplyCommonAxisSettingsPayload = {
    xAxis: NonNullable<Highcharts.Options['xAxis']>;
    yAxis: NonNullable<Highcharts.Options['yAxis']>;
    shared: ServerChartsConfig;
};

const applyCommonAxisSettings = ({
    shared,
    xAxis,
    yAxis,
}: ApplyCommonAxisSettingsPayload): {
    xAxis: NonNullable<Highcharts.Options['xAxis']>;
    yAxis: NonNullable<Highcharts.Options['yAxis']>;
} => {
    const visualization = shared.visualization;

    const ignore: IgnoreProps = {
        title: Boolean((shared.segments || []).length),
    };

    // Apply common settings for axes
    if (
        visualization.id === 'line' ||
        visualization.id === 'area' ||
        visualization.id === 'area100p' ||
        visualization.id === 'column' ||
        visualization.id === 'column100p' ||
        visualization.id === 'bar' ||
        visualization.id === 'bar100p' ||
        visualization.id === 'scatter' ||
        visualization.id === 'combined-chart'
    ) {
        let x: ServerPlaceholder | undefined;
        let y: ServerPlaceholder | undefined;
        let y2: ServerPlaceholder | undefined;

        if (visualization.id === 'combined-chart') {
            visualization.layers?.forEach((layer) => {
                const placeholders = layer.placeholders;

                x = x?.items.length ? x : placeholders[0];
                y = y?.items.length ? y : placeholders[1];
                y2 = y2?.items.length ? y2 : placeholders[2];
            });
        } else {
            const placeholders = visualization.placeholders;

            x = placeholders[0];
            y = placeholders[1];
            y2 = placeholders[2];
        }

        let axes: (Highcharts.XAxisOptions | Highcharts.YAxisOptions)[] = [
            xAxis as Highcharts.XAxisOptions,
        ];
        let axesData = [x];

        if (y?.items.length && y2?.items.length) {
            yAxis = [
                {
                    opposite: false,
                    labels: {
                        y: 3,
                    },
                },
                {
                    opposite: true,
                    labels: {
                        y: 3,
                    },
                },
            ];

            axes = [...axes, yAxis[0], yAxis[1]];
            axesData = [...axesData, y, y2];
        } else {
            (yAxis as Highcharts.XAxisOptions).opposite = Boolean(
                !y?.items.length && y2?.items.length,
            );
            (yAxis as Highcharts.XAxisOptions).labels = {
                y: 3,
            };

            axes = [...axes, yAxis as Highcharts.XAxisOptions];
            const isY2HasItems = y2 && y2.items.length;
            axesData = [...axesData, isY2HasItems ? y2 : y];
        }

        // eslint-disable-next-line complexity
        axes.forEach((axis, i) => {
            const axisData = axesData[i];

            applyPlaceholderSettingsToAxis(axisData, axis, ignore);
        });
    }

    return {xAxis, yAxis};
};

type ExtendPlotOptionsPayload = {
    visualizationId: string;
    plotOptions: NonNullable<Highcharts.PlotOptions>;
};

const extendPlotOptions = ({visualizationId, plotOptions}: ExtendPlotOptionsPayload) => {
    switch (visualizationId) {
        case 'column':
            plotOptions.column = plotOptions.column || {};
            plotOptions.column.stacking = 'normal';
            break;

        case 'bar':
            plotOptions.bar = plotOptions.bar || {};
            plotOptions.bar.stacking = 'normal';
            break;

        case 'column100p':
            plotOptions.column = plotOptions.column || {};
            plotOptions.column.stacking = 'percent';
            break;

        case 'bar100p':
            plotOptions.bar = plotOptions.bar || {};
            plotOptions.bar.stacking = 'percent';
            break;

        case 'area':
            plotOptions.area = {
                stacking: 'normal',
            };
            break;

        case 'area100p':
            plotOptions.area = {
                stacking: 'percent',
            };
            break;

        case 'donut':
            plotOptions.pie = {
                innerSize: '50%',
            };
            break;
    }

    switch (visualizationId) {
        case 'column':
        case 'column100p':
        case 'bar':
        case 'bar100p': {
            plotOptions.column = plotOptions.column || {};
            plotOptions.column.dataGrouping = plotOptions.column.dataGrouping || {};
            // CHARTS-6460
            plotOptions.column.dataGrouping.enabled = false;
            plotOptions.column.maxPointWidth = 50;

            plotOptions.bar = plotOptions.bar || {};
            break;
        }
    }
};
