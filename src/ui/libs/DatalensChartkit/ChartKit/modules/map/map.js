import Highcharts from 'highcharts';
import merge from 'lodash/merge';
import throttle from 'lodash/throttle';

import {
    TOOLTIP_ROOT_CLASS_NAME,
    buildLegend,
    handleScroll,
    tooltipPositioner,
} from '../graph/config/config';
import {initHighchartsMap} from '../highcharts/highcharts';

import defaultOptions from './options';
import formatTooltip from './tooltip/tooltip';

// CHARTS-5293#62742a063019347e74157c5b
let highchartsMapInitialized = false;

function formatNumber(number, {format}) {
    const multiplier = format && format.percent ? 100 : 1;
    const suffix = multiplier > 1 ? ' %' : '';
    const precision = format && format.precision ? format.precision : 0;
    return Highcharts.numberFormat(number * multiplier, precision, ',', ' ') + suffix;
}

function hideFixedTooltip(tooltip) {
    tooltip.fixed = false;
    tooltip.hide();

    tooltip.pointsOnFixedTooltip.setState('');
    tooltip.pointsOnFixedTooltip = null;

    tooltip.update({
        positioner: tooltipPositioner,
        style: {
            ...tooltip.style,
            pointerEvents: 'none',
        },
    });
}

function fixTooltip(tooltip, options, event) {
    if (tooltip.fixed) {
        hideFixedTooltip(tooltip);
        tooltip.refresh(tooltip.chart.hoverPoints[0], event);
    } else {
        if (!tooltip.chart.hoverPoints) {
            return false;
        }

        const {x, y} = tooltip.now;

        tooltip.update({
            style: {
                ...tooltip.style,
                pointerEvents: 'auto',
            },
            positioner: () => ({x, y}),
        });

        tooltip.refresh(tooltip.chart.hoverPoints[0], event);
        tooltip.pointsOnFixedTooltip = tooltip.chart.hoverPoints[0];
        tooltip.fixed = true;

        if (options.nonBodyScroll && !tooltip.scrollHandler) {
            tooltip.scrollHandler = handleScroll.bind(tooltip);

            tooltip.chart.topPosition = tooltip.chart.container.getBoundingClientRect().top;
            window.addEventListener('scroll', tooltip.scrollHandler, true);
        }
    }
}

// TODO: check whether the functionality of dateTimeLabels HC does not duplicate
function getDateTimeLabelFormats(scale) {
    let minTickInterval;
    let strftime = '';

    switch (scale) {
        case 'd':
            minTickInterval = 3600 * 24 * 1000;
            strftime = '%d %B %Y';
            break;
        case 'w':
            minTickInterval = 3600 * 24 * 7 * 1000;
            strftime = '%d %B %Y';
            break;
        case 'm':
            minTickInterval = 3600 * 24 * 27 * 1000;
            strftime = '%B %Y';
            break;
        case 'i':
            minTickInterval = 60 * 1000;
            strftime = '%d %B %Y %H:%M';
            break;
        case 's':
            minTickInterval = 1000;
            strftime = '%d %B %Y %H:%M:%S';
            break;
        case 'h':
            minTickInterval = 3600 * 1000;
            strftime = '%d %B %Y %H:%M';
            break;
        case 'q':
            minTickInterval = 3600 * 24 * 85 * 1000;
            strftime = "%Q'%Y";
            break;
        case 'y':
            minTickInterval = 3600 * 24 * 27 * 1000;
            strftime = '%Y';
            break;
    }

    return {
        mintickinterval: minTickInterval,
        strftime: strftime,
    };
}

const throttledAppendTooltip = throttle(function (container, tooltipMarkup) {
    container.innerHTML = tooltipMarkup;
}, 500);

function getMap(options, data) {
    if (!highchartsMapInitialized) {
        highchartsMapInitialized = true;
        initHighchartsMap();
    }

    data = Array.isArray(data) ? data : data.map;

    options.scale = options.scale || 'd';
    options.type = 'map';

    const scale = getDateTimeLabelFormats(options.scale);

    const params = merge({}, defaultOptions, {
        series: data,
        chart: {
            events: {
                click: function () {
                    if (this.tooltip.fixed) {
                        hideFixedTooltip(this.tooltip);
                    }
                },
            },
        },
        tooltip: {
            outside: true,
            positioner: tooltipPositioner,
            className: `${TOOLTIP_ROOT_CLASS_NAME} chartkit-theme_common`,
            formatter: function (tooltip) {
                if (this.point) {
                    if (!this.point.name_local) {
                        this.point.name_local = this.point.properties.name_ru;
                    }

                    this.point.header = this.point.datetime
                        ? Highcharts.dateFormat(
                              scale.strftime,
                              new Date(Number(this.point.datetime)),
                          )
                        : this.point.name_local;

                    if (!this.point.tooltipValues) {
                        this.point.tooltipValues = [
                            {
                                value: this.point.value,
                                title: this.series.name,
                            },
                        ];
                    }

                    if (typeof options.manageTooltipConfig === 'function') {
                        Object.assign(this.point, options.manageTooltipConfig(this.point));
                    }

                    this.point.tooltipValues.forEach((point, index) => {
                        point.colorBubble = index === 0;
                        point.formatted = point.formatted || formatNumber(point.value, options);
                    });

                    const isSplitTooltip = tooltip.splitTooltip;

                    const tooltipRender = formatTooltip(this.point, isSplitTooltip);

                    if (isSplitTooltip) {
                        throttledAppendTooltip(tooltip.getTooltipContainer(), tooltipRender);

                        return null;
                    }

                    return tooltipRender;
                }
            },
        },
        title: {
            text: options.title,
        },
        subtitle: {
            text: options.subtitle,
        },
        legend: {
            ...buildLegend(options),
        },
        plotOptions: {
            map: {
                dataLabels: {
                    enabled: options.displayLabels,
                    formatter: function () {
                        return formatNumber(this.point.value, options);
                    },
                },
                events: {
                    click: function (event) {
                        fixTooltip(this.chart.tooltip, options, event);
                    },
                },
            },
        },
        colorAxis: {
            labels: {},
        },
    });

    if (options.format) {
        params.colorAxis.labels.formatter = function () {
            return formatNumber(this.value, options);
        };
    }

    if (Array.isArray(data) && data[0]) {
        if (params.title.text === undefined) {
            params.title.text = data[0].title;
        }

        if (data[0].datetime) {
            const datetime = Highcharts.dateFormat(
                scale.strftime,
                new Date(Number(data[0].datetime)),
            );
            if (!params.title.text) {
                params.title.text = datetime;
            } else if (!params.subtitle.text) {
                params.subtitle.text = datetime;
            }
        }
    }

    params.series.forEach((serie) => {
        // array elements are deleted via delete, and undefined appears in their place
        serie.data = serie.data.filter(Boolean);
    });

    // TODO: why using some method?
    params.series.some((series) =>
        series.data.some((point) => {
            if (point.value === 0) {
                point.value = 0.001;
                params.colorAxis.min = Math.min(1, params.colorAxis.min || 1);
            }
            if (point.value < 0) {
                params.colorAxis.type = 'linear';
                return true;
            }
            return false;
        }),
    );

    merge(params, options.highcharts);

    return {
        config: params,
        callback: () => {},
    };
}

export {getMap};
