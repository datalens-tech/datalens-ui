/* eslint-disable camelcase */

// import React from 'react';
import Highcharts from 'highcharts';
import {i18n} from 'i18n';
import omit from 'lodash/omit';
import moment from 'moment';

import {registry} from '../../../../../registry';
import {LINE_BREAKS_OPTIONS} from '../../constants/constants';
import DatalensChartkitCustomError from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import {CHARTS_ERROR_CODE} from '.';

const CONFIG_TYPE = {
    GRAPH_WIZARD: 'graph_wizard',
    METRIC_WIZARD: 'metric_wizard',
};

const defaultQuickIntervals = [
    {name: {ru: '30 дней', en: '30 days'}, interval: [30, 'days']},
    {name: {ru: '3 месяца', en: '3 months'}, interval: [3, 'months']},
    {name: {ru: '6 месяцев', en: '6 months'}, interval: [6, 'months']},
    {name: {ru: '12 месяцев', en: '12 months'}, interval: [12, 'months']},
    {name: {ru: '2 года', en: '2 years'}, interval: [2, 'years']},
    {name: {ru: '3 года', en: '3 years'}, interval: [3, 'years']},
];

function setConfigForAxis(axis, side, highstock, graph) {
    const currentAxis = {};

    if (axis && axis.visible === 'yes') {
        if (axis.suffix && axis.suffix.length) {
            currentAxis.labels = {
                suffix: axis.suffix,
                formatter: function () {
                    return (
                        Highcharts.Axis.prototype.defaultLabelFormatter.call(this) +
                        this.axis.userOptions.labels.suffix
                    );
                },
            };
        }

        if (highstock && highstock.allow === 'yes' && side === 'right') {
            if (axis.order && axis.order === 'reverse') {
                currentAxis.showFirstLabel = false;
                currentAxis.showLastLabel = true;
            } else {
                currentAxis.showFirstLabel = true;
                currentAxis.showLastLabel = false;
            }
        }

        if (axis.name && axis.name.length) {
            currentAxis.title = {
                text: axis.name,
                style: {
                    color: axis.color,
                },
            };
        } else {
            currentAxis.title = '';
        }

        if (axis.extremes && axis.extremes === 'manual') {
            if (axis.min && axis.min.length) {
                currentAxis.min = Number(axis.min);
            }
            if (axis.max && axis.max.length) {
                currentAxis.max = Number(axis.max);
            }
        }
    } else {
        currentAxis.labels = {enabled: false};
        currentAxis.title = null;

        if (side === 'left') {
            graph.chart.marginLeft = 0;
        }

        if (side === 'right') {
            graph.chart.marginRight = 0;
        }
    }

    if (axis.order && axis.order === 'reverse') {
        currentAxis.reversed = true;
    }

    if (axis && axis.grid === 'no') {
        currentAxis.gridLineWidth = 0;
    }

    currentAxis.opposite = side === 'right';

    if (axis.logarithmic === 'yes') {
        currentAxis.type = 'logarithmic';
    }

    return currentAxis;
}

function _processHighcharts({axis, legend, config, highstock}) {
    const graph = {
        chart: {
            marginLeft: null,
            marginRight: null,
            marginTop: null,
            marginBottom: null,
            alignTicks: axis.yRight.commonGrid === 'yes',
        },
        legend: {},
        xAxis: {},
    };

    graph.yAxis = [
        setConfigForAxis(axis.yLeft, 'left', highstock, graph),
        setConfigForAxis(axis.yRight, 'right', highstock, graph),
    ];

    if (axis.x.visible === 'no') {
        graph.xAxis.labels = {enabled: false};
        graph.xAxis.tickWidth = 0;
        graph.xAxis.lineWidth = 0;
    }

    if (axis.x.grid === 'no') {
        graph.xAxis.gridLineWidth = 0;
        graph.xAxis.lineWidth = 0;
    }

    if (axis.x.visible === 'yes') {
        graph.xAxis.lineWidth = 1;
    }

    if (legend && legend.visible === 'yes') {
        if (legend.margin === 'manual') {
            if (!isNaN(Number(legend.marginX))) {
                graph.legend.x = Number(legend.marginX);
            }

            if (!isNaN(Number(legend.marginY))) {
                graph.legend.y = Number(legend.marginY);
            }
        }
    }

    if (config.showValues && (config.showValues === 'all' || config.showValues === 'onlyLast')) {
        graph.plotOptions = {
            series: {
                dataLabels: {
                    enabled: true,
                    style: {
                        fontWeight: config.showValues === 'onlyLast' ? 'bold' : 'normal',
                        fontSize: config.showValues === 'onlyLast' ? '12px' : '11px',
                    },
                    allowOverlap: config.showValues === 'onlyLast',
                    formatter: function () {
                        if (
                            (config.showValues === 'onlyLast' &&
                                this.point.index === this.series.data.length - 1) ||
                            config.showValues === 'all'
                        ) {
                            if (Number.isInteger(this.y)) {
                                return Highcharts.numberFormat(this.y, 0, ',', ' ');
                            }
                            return Highcharts.numberFormat(
                                this.y,
                                this.series.options.precision,
                                ',',
                                ' ',
                            );
                        }
                        return null;
                    },
                },
            },
        };
    }

    return graph;
}

function _replaceWizardParam(target, parameterization) {
    return target
        ? target.replace(/\$([A-Za-z0-9_]+)/g, (str, param) =>
              parameterization[param] ? parameterization[param][0] : param,
          )
        : target;
}

// TODO: clarify parameterization and params
function _processConfig(
    {axis, config, highstock, legend, order, tooltip, parameterization = {}},
    {categories_ms},
    params,
    configName,
) {
    const statface_graph = {
        scale: axis.x.scale,
        type: config.type,
        region: config.region,
        title: _replaceWizardParam(config.title, params),
        subtitle: _replaceWizardParam(config.subtitle, params),
        periodValue: _replaceWizardParam(config.periodValue, params), // TODO: check whether it is really necessary here
    };

    if (
        order &&
        order.orderType &&
        (order.orderType === 'alphabet' || order.orderType === 'byLastValue')
    ) {
        statface_graph.orderType = order.orderType;

        if (
            order.orderSort &&
            (order.orderSort === 'fromBottom' || order.orderSort === 'fromTop')
        ) {
            statface_graph.orderSort = order.orderSort;
        }
    }

    if (tooltip && tooltip.enableSum) {
        statface_graph.enableSum = tooltip.enableSum === 'yes';
    }

    if (axis.x.scaleFormat) {
        statface_graph.scaleFormat = axis.x.scaleFormat;
    }

    if (legend && legend.visible && legend.visible === 'no') {
        statface_graph.hideLegend = true;
    } else if (
        [
            'inside-left-bottom',
            'inside-left-top',
            'inside-right-bottom',
            'inside-right-top',
        ].indexOf(legend.position) !== -1
    ) {
        switch (legend.position) {
            case 'inside-left-bottom':
                statface_graph.legendPosition = 7;
                break;
            case 'inside-left-top':
                statface_graph.legendPosition = 11;
                break;
            case 'inside-right-bottom':
                statface_graph.legendPosition = 5;
                break;
            case 'inside-right-top':
                statface_graph.legendPosition = 1;
                break;
        }
    }

    // config for later reading
    if (config.comments && config.comments === 'yes') {
        statface_graph.comments = {
            path: configName,
            matchedParams: Object.keys(parameterization)
                .map((key) => parameterization[key])
                .reduce((result, {name, match}) => {
                    if (match) {
                        result.push(name);
                    }
                    return result;
                }, []),
        };
    }

    if (config.calendar === 'outside') {
        statface_graph.notOverlayControls = true;
    }

    if (highstock && highstock.allow === 'yes' && categories_ms.length) {
        const momentScale = {
            h: 'hours',
            d: 'days',
            m: 'months',
            y: 'years',
        };

        const maxCategoriesMs = categories_ms[categories_ms.length - 1];
        const minNavigatorMs = Number(
            moment
                .utc(maxCategoriesMs, 'x')
                .subtract(highstock.periodValue, momentScale[highstock.periodScale] || 'days')
                .format('x'),
        );

        statface_graph.highstock = {
            range_min: minNavigatorMs,
            range_max: maxCategoriesMs,
        };
    }

    return statface_graph;
}

function _processExtra({confStorageConfig, data, params}) {
    const processed = {};

    if (
        confStorageConfig.config.calendar === 'outside' ||
        confStorageConfig.config.calendar === 'inside'
    ) {
        // TODO: check if it is possible not to change the params object

        if (!params.date_min || !moment(params.date_min).isValid()) {
            params.date_min = moment.utc(data.categories_ms[0], 'x').format('YYYY-MM-DD');
        }

        if (!params.date_max || !moment(params.date_max).isValid()) {
            params.date_max = moment
                .utc(data.categories_ms[data.categories_ms.length - 1], 'x')
                .format('YYYY-MM-DD');
        }

        processed.uiScheme = [
            {
                type: 'range-datepicker',
                paramFrom: 'date_min',
                paramTo: 'date_max',
                paramFormat: 'YYYY-MM-DD',
                quickIntervals: defaultQuickIntervals,
                updateOnChange: true,
            },
        ];
    }

    return processed;
}

function run(loaded) {
    const {
        data,
        params: fullParams,
        sources,
        usedParams,
        unresolvedParams = undefined,
        requestId,
        traceId,
        _confStorageConfig: {data: config, type, entryId, key},
        publicAuthor,
        widgetConfig,
    } = loaded;

    try {
        const params = omit(fullParams, 'name');

        let result = {
            type: type.match(/^[^_]*/)[0],
            data,
            params,
            entryId,
            key: key,
            usedParams,
            sources,
            requestId,
            traceId,
            isNewWizard: false,
            isOldWizard: true,
            extra: {},
            widgetConfig,
        };

        if (unresolvedParams) {
            result.unresolvedParams = unresolvedParams;
        }

        if (publicAuthor) {
            result.publicAuthor = publicAuthor;
        }

        switch (type) {
            case CONFIG_TYPE.GRAPH_WIZARD: {
                data.graphs.forEach((graph) => {
                    if (graph.lineWidth) {
                        graph.lineWidth = Number(graph.lineWidth); // if it is a string, then when hovering the line becomes wide
                    }
                    graph.id = graph.reportId ? `${graph.reportId}_${graph.fname}` : graph.fname;
                });

                // We sort the lines to get correct order when exporting
                data.graphs.sort((a, b) => a.index - b.index);

                result.libraryConfig = _processHighcharts(config);
                result.config = _processConfig(config, data, params, key);

                const {uiScheme} = _processExtra({
                    confStorageConfig: config,
                    data,
                    params,
                });

                if (uiScheme) {
                    result.controls = {
                        controls: uiScheme || [],
                        lineBreaks: LINE_BREAKS_OPTIONS.NOWRAP,
                    };
                }

                const postProcessRunResult = registry.chart.functions.get('postProcessRunResult');

                if (postProcessRunResult) {
                    result = {...result, ...postProcessRunResult(loaded)};
                }

                break;
            }
            case CONFIG_TYPE.METRIC_WIZARD:
                break;
        }

        return result;
    } catch (error) {
        throw DatalensChartkitCustomError.wrap(error, {
            code: CHARTS_ERROR_CODE.PROCESSING_ERROR,
            message: i18n('chartkit.data-provider', 'error-processing'),
        });
    }
}

export default run;
