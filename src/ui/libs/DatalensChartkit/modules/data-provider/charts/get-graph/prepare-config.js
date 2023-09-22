import Highcharts from 'highcharts';
import merge from 'lodash/merge';
import mergeWith from 'lodash/mergeWith';

export const TOOLTIP_ROOT_CLASS_NAME = 'chartkit-highcharts-tooltip-container';

const CUSTOM_TYPES = {
    stack: {
        type: 'area',
        stacking: 'normal',
    },
    stacked_100p: {
        type: 'area',
        stacking: 'percent',
    },
    stacked_column: {
        type: 'column',
        stacking: 'normal',
    },
    stacked_column_100p: {
        type: 'column',
        stacking: 'percent',
    },
};

function prepareZones(options) {
    const plotbands = [];
    const zonesColors = ['#FFD3C9', '#FFFFC9', '#C9FFCA', '#C4C6D4', '#D4C4D2'];

    for (let i = 0; i < options.zones.length; i++) {
        let nowColor = options.zones[i].color;
        if (!nowColor.length) {
            nowColor = zonesColors[i];
        }

        let nowFrom = options.zones[i].from;
        if (nowFrom === 'min') {
            nowFrom = -Infinity;
        }

        let nowTo = options.zones[i].to;
        if (nowTo === 'max') {
            nowTo = Infinity;
        }

        const nowzone = {
            color: nowColor,
            from: nowFrom,
            to: nowTo,
            label: {
                text: options.zones[i].text,
                textAlign: 'left',
                style: {
                    color: '#3E576F',
                    'font-size': '8pt',
                },
            },
        };

        plotbands.push(nowzone);
    }

    return plotbands;
}

function getTypeParams(data, options) {
    const params = {
        xAxis: {labels: {}},
        yAxis: {},
    };
    // const period = options.period;

    if (data.categories_ms) {
        params.xAxis.type = 'datetime';
        params.xAxis.labels.staggerLines = 1;
    } else {
        const flag = options.type === 'line' || options.type === 'area';
        params.xAxis.startOnTick = flag;
        params.xAxis.endOnTick = flag;

        if (data.categories) {
            params.xAxis.categories = data.categories;
        }
    }

    if (options.zones) {
        params.yAxis.plotBands = prepareZones(options);
    }

    return params;
}

function getParamsByCustomType(type = 'line', options) {
    const customType = CUSTOM_TYPES[type];
    if (customType) {
        options.enableSum =
            options.enableSum === undefined || options.enableSum === null || options.enableSum;
        return {
            chart: {type: customType.type},
            plotOptions: {
                [customType.type]: {
                    stacking: customType.stacking,
                },
            },
        };
    }

    return {chart: {type}};
}

export function prepareConfig(data, options) {
    const series = data.graphs || data;
    const params = merge(getParamsByCustomType(options.type, options), {
        _config: options,
        title: {
            text: options.hideTitle ? null : options.title,
            floating: options.titleFloating,
        },
        subtitle: {
            text: options.hideTitle ? null : options.subtitle,
        },
        series,
        plotOptions: {
            xrange: {
                stickyTracking: false,
            },
            area:
                series.length === 1
                    ? {
                          trackByArea: false,
                          stickyTracking: true,
                      }
                    : {},
        },
        xAxis: {
            labels: {
                formatter: function () {
                    const axis = this.axis;
                    const highchartsScale = this.chart.userOptions._config.highchartsScale;

                    if (axis.options.type === 'datetime' && highchartsScale) {
                        const dateTimeLabelFormat =
                            axis.options.dateTimeLabelFormats[highchartsScale];
                        return this.chart.time.dateFormat(
                            dateTimeLabelFormat.main || dateTimeLabelFormat,
                            this.value,
                        );
                    }

                    return Highcharts.Axis.prototype.defaultLabelFormatter.call(this);
                },
            },
        },
    });

    if (Array.isArray(options.hide_series)) {
        params.series.forEach((serie) => {
            if (options.hide_series.indexOf(serie.name) !== -1) {
                serie.visible = false;
            }
        });
    }

    const dataLabels = options.highcharts?.plotOptions?.series?.dataLabels;
    const seriesDataLabelsFormatter = dataLabels ? {dataLabels} : {};

    const preparedHighchartsOptions = merge(
        {},
        {
            plotOptions: {
                area: seriesDataLabelsFormatter,
                bar: seriesDataLabelsFormatter,
                column: seriesDataLabelsFormatter,
                line: seriesDataLabelsFormatter,
            },
        },
        options.highcharts,
    );

    mergeWith(params, getTypeParams(data, options), preparedHighchartsOptions);

    // https://github.com/highcharts/highcharts/issues/5671
    // http://jsfiddle.net/yo12kv0b/
    if (params.plotOptions.area && params.plotOptions.area.stacking === 'normal') {
        params.series.forEach((serie, serieIndex) => {
            if (serie.type === undefined) {
                let hasNegativeValues = false;
                let hasPositiveValues = false;

                serie.data.forEach((value) => {
                    let actualValue = value;
                    if (Array.isArray(value)) {
                        actualValue = value[1];
                    } else if (value && typeof value.y === 'number') {
                        actualValue = value.y;
                    }

                    if (actualValue > 0) {
                        hasPositiveValues = true;
                    } else if (actualValue < 0) {
                        hasNegativeValues = true;
                    }
                });

                const serieHasIntersectionWithOthers = params.series.some(
                    (serieItem, serieItemIndex) => {
                        if (serieItemIndex === serieIndex) {
                            return false;
                        } else {
                            const serieSet = new Set(serie.data.map((item) => item.x));
                            const serieItemIndexSet = new Set(serieItem.data.map((item) => item.x));

                            for (const item of serieSet) {
                                if (serieItemIndexSet.has(item)) {
                                    return true;
                                }
                            }

                            return false;
                        }
                    },
                    false,
                );

                if (serieHasIntersectionWithOthers) {
                    if (hasPositiveValues && !hasNegativeValues) {
                        serie.stack = 'positive';
                    } else if (!hasPositiveValues && hasNegativeValues) {
                        serie.stack = 'negative';
                    }
                }
            }
        });
    }

    return params;
}
