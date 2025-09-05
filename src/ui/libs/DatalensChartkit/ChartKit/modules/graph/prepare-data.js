import lodashMin from 'lodash/min';

import {ChartKitCustomError, ERROR_CODE} from '../chartkit-custom-error/chartkit-custom-error';

/* eslint-disable complexity */
function prepareValue(value, firstValue, options) {
    if (value === null) {
        return null;
    }
    if (options.normalizeDiv) {
        return value / (firstValue || 1);
    }
    if (options.normalizeSub) {
        return value - firstValue;
    }
    return value;
}

function sortByLastValue(a, b) {
    if (a._lastValue < b._lastValue) {
        return -1;
    }
    if (a._lastValue > b._lastValue) {
        return 1;
    }
    return 0;
}

function sortByAlphabet(a, b) {
    if (a.name < b.name) {
        return -1;
    }
    if (a.name > b.name) {
        return 1;
    }
    return 0;
}

const HIGHCHARTS_SCALE = {
    s: 'second',
    // i: 'minute', // because minutes are the default values for ChartWizard, (usually nobody change)
    h: 'hour',
    d: 'day',
    w: 'week',
    m: 'month',
    q: 'quarter',
    y: 'year',
};

function computeXTickScale(range) {
    const timeUnits = {
        s: 1000,
        i: 60000,
        h: 3600000,
        d: 86400000,
        w: 604800000,
        m: 2419200000,
        q: 7344000000,
        y: 31449600000,
    };
    let previous = 's';

    // eslint-disable-next-line guard-for-in
    for (const current in timeUnits) {
        if (timeUnits[current] > range) {
            return previous;
        }
        previous = current;
    }

    return previous;
}

export function prepareData(data, options) {
    if (
        !data ||
        (typeof data === 'object' && !Object.keys(data).length) ||
        (data.graphs &&
            !(
                data.graphs.length && data.graphs.some((graph) => graph.data && graph.data.length)
            )) ||
        (Array.isArray(data) && !data.length)
    ) {
        throw new ChartKitCustomError(null, {code: ERROR_CODE.NO_DATA});
    }

    if (data.graphs) {
        if (data.graphs.length > 50 && !options.withoutLineLimit) {
            throw new ChartKitCustomError(null, {code: ERROR_CODE.TOO_MANY_LINES});
        }

        data.graphs.forEach((graph) => {
            graph.name = graph.name || graph.title;
        });

        let min = false;
        let max = false;

        if (data.categories_ms) {
            options.highchartsScale = HIGHCHARTS_SCALE[options.scale];

            const closestPointRange = lodashMin(
                data.categories_ms.map(
                    (timestamp, index) => timestamp - data.categories_ms[index - 1],
                ),
            );
            options.scale = options.scale || computeXTickScale(closestPointRange);

            if (options.scale && options.scale.length > 1) {
                // for scales of the type 'w_by_d_sum', we take only the first character if it is among the correct ones
                const match = options.scale.match(/^[sihyqmwd]/g);
                options.scale = match ? match[0] : null;
            }

            data.graphs
                .filter(({data}) => Boolean(data))
                .forEach((graph, index) => {
                    let result = [];
                    const aloneOrHasNull =
                        graph.data.length === 1 || graph.data.indexOf(null) !== -1;

                    const firstValue = graph.data[0];

                    if (aloneOrHasNull) {
                        result = graph.data.map((val, pos) => {
                            if (val !== null && typeof val === 'object') {
                                return val;
                            }

                            const preparedVal = prepareValue(val, firstValue, options);

                            const currentPoint = {
                                x: data.categories_ms[pos],
                                y: preparedVal,
                            };

                            if (preparedVal !== null) {
                                min = Math.min(min, preparedVal);
                                max = Math.max(max, preparedVal);
                            }

                            return currentPoint;
                        });
                    } else {
                        result = graph.data.map((val, pos) => {
                            if (val !== null && typeof val === 'object') {
                                return val;
                            }
                            const preparedVal = prepareValue(val, firstValue, options);
                            min = Math.min(min, preparedVal);
                            max = Math.max(max, preparedVal);
                            return [data.categories_ms[pos], preparedVal];
                        });
                    }

                    data.graphs[index].data = result;
                });

            delete data.categories;
        }

        if (data.categories) {
            delete data.categories_ms;
        }

        if (options.orderType === 'byLastValue') {
            data.graphs.forEach((graphItem) => {
                graphItem._lastValue =
                    (graphItem.data &&
                        graphItem.data[graphItem.data.length - 1] &&
                        (graphItem.data[graphItem.data.length - 1][1] ||
                            graphItem.data[graphItem.data.length - 1].y)) ||
                    0;
            });
            data.graphs.sort(sortByLastValue);
        }

        if (options.orderType === 'alphabet') {
            data.graphs.sort(sortByAlphabet);
        }

        if (
            (options.orderType === 'byLastValue' || options.orderType === 'alphabet') &&
            options.orderSort === 'fromBottom'
        ) {
            data.graphs.reverse();
        }

        options.max = max;
        options.min = min;
    }
}
