import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import type {Diff, MetricWidgetDataItem, NumberConfig} from '../types';

export const GREEN_BACKGROUND = '#e2ffd4'; // for text and graphics (darker)
export const GREEN_COLOR = '#080'; // for the color of the widget itself (lighter)
export const RED_BACKGROUND = '#ffd4d4';
export const RED_COLOR = '#800';

export const graphOptions = {
    xAxis: {
        visible: false,
        startOnTick: false,
        endOnTick: false,
        tickWidth: 0,
    },
    yAxis: {
        visible: false,
        endOnTick: false,
        startOnTick: false,
        tickWidth: 0,
    },
    legend: {
        enabled: false,
    },
    tooltip: {
        backgroundColor: null,
        hideSeriesName: true, // custom piece
        shadow: false,
        shared: true,
        padding: 0,
        hideDelay: 100,
        formatter: function (this: Highcharts.TooltipFormatterContextObject) {
            return new Intl.NumberFormat().format(this.y);
        },
    },
    plotOptions: {
        series: {
            animation: false,
            lineWidth: 1,
            shadow: false,
            states: {
                hover: {
                    lineWidth: 1,
                },
            },
            marker: {
                radius: 1,
                states: {
                    hover: {
                        radius: 2,
                    },
                },
            },
            fillOpacity: 0.25,
            color: '#000',
        },
        column: {
            negativeColor: '#910000',
            borderColor: 'silver',
        },
        areaspline: {
            marker: {
                enabled: false,
            },
        },
        spline: {
            marker: {
                enabled: false,
            },
        },
    },
    chart: {
        width: 130,
        height: 60,
        marginRight: 10,
        backgroundColor: 'transparent',
        style: {
            overflow: 'visible',
        },
    },
};

export const formatValue = (
    initialValue: string | number | undefined | null,
    withSign?: boolean,
    format?: string,
) => {
    const suffixes = ['', 'k', 'M', 'G', 'T', 'P'];
    let rank = 0;
    let unit = '';
    let sign = '';

    let valueAsNumber = Number(initialValue);

    if (isNaN(valueAsNumber) || valueAsNumber === null) {
        return {
            value: '–',
        };
    }

    if (valueAsNumber < 0) {
        sign = '-';
        valueAsNumber = Math.abs(valueAsNumber);
    } else if (withSign) {
        sign = '+';
    }

    switch (format) {
        case 'percentage':
            valueAsNumber = valueAsNumber * 100;
            unit = '%';
            break;
        default:
            while (Math.round(valueAsNumber) >= 999.5) {
                // 999.5 because greater values will be rounded to 1000
                valueAsNumber = valueAsNumber / 1000;
                rank++;
            }
            unit = suffixes[rank];
    }

    let value = String(valueAsNumber);

    if (Math.floor(valueAsNumber) !== valueAsNumber) {
        if (valueAsNumber < 1) {
            value = valueAsNumber.toFixed(2);
        } else {
            value = valueAsNumber.toPrecision(3);
        }
    }

    return {
        value,
        unit: unit,
        sign: sign,
    };
};

export const getBackground = (data: MetricWidgetDataItem, green: string, red: string) => {
    const content = data.content;
    let background;
    let diffContent;

    if (content.diffPercent && content.diffPercent.value) {
        diffContent = content.diffPercent;
    } else if (content.current.value != undefined && content.last && content.last.value) {
        diffContent = formatValue(
            (Number(content.current.value) - Number(content.last.value)) /
                Math.abs(Number(content.last.value)),
            true,
            'percentage',
        );
    }

    if (diffContent) {
        const diff = diffContent.value;
        const diffSign = diffContent.sign;

        const getBackgroundByDiff = function (isMoreGreen: boolean) {
            if (diff) {
                if (!data.colorizeInterval || Math.abs(Number(diff)) > data.colorizeInterval) {
                    const isDiffPositive = Number(diff) > 0 && diffSign !== '-';
                    return isDiffPositive === isMoreGreen ? green : red;
                }
            }

            return '';
        };

        if (data.colorize && diff) {
            switch (data.colorize) {
                case 'more-green':
                    background = getBackgroundByDiff(true);
                    break;
                case 'less-green':
                    background = getBackgroundByDiff(false);
                    break;
            }
        }
    }

    return background;
};

export const getFormattedValue = (options: NumberConfig) => {
    let value = options.value;
    let sign = null;

    if (options && options.formatted) {
        const formattedValue = formatValue(value);

        value = formattedValue.value;
        sign = formattedValue.sign;
    }

    return `${sign === '-' ? sign : ''}${value}`;
};

export const getUnitValue = (options: Diff) => {
    let unit = options.unit;

    if (options && options.formatted) {
        const formattedValue = formatValue(options.value);

        if (unit) {
            unit = `${formattedValue.unit} ${unit}`;
        } else {
            unit = formattedValue.unit;
        }
    }

    return unit;
};
