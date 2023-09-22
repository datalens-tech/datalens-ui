const moment = require('moment');

// eslint-disable-next-line
moment.locale('ru');

const groupingValuesArray = [
    'date',
    'startOfYear',
    'startOfQuarter',
    'startOfMonth',
    'startOfWeek',
    'startOfHour',
    'startOfDekaminute',
    'startOfMinute',
    'dateTime',
];

/**
 * Check dimensions from Metrica
 * @param {Object} metricsData
 * @returns {Number}
 */
function checkDimensions(metricsData) {
    let index = -1;

    const values = metricsData.query.dimensions.filter((dimension, dimensionIndex) => {
        const value = dimension.split(':').pop();
        if (groupingValuesArray.indexOf(value) > -1) {
            index = dimensionIndex;
            return true;
        } else {
            return false;
        }
    }).length;

    if (values.length > 1) {
        throw new Error('need less dimensions: ' + values.join(','));
    }

    return index;
}

/**
 * Generate array with time interval
 * @param {String} firstDateString
 * @param {String} secondDateString
 * @param {String} group
 * @returns {Array}
 */
function prepareDatesMs(firstDateString, secondDateString, group) {
    const fixedGroup = group || 'day';

    const intervals = [];

    const date1 = moment.utc(firstDateString);
    const date2 = moment.utc(secondDateString);

    date1.startOf(fixedGroup);

    intervals.push(moment.utc(date1.add(0, fixedGroup)).valueOf());
    while (moment.duration(date2.valueOf() - date1.valueOf()) >= moment.duration(1, fixedGroup)) {
        intervals.push(moment.utc(date1.add(1, fixedGroup)).valueOf());
    }

    return intervals;
}

/**
 * Check limit
 * @param {Object} metricasData
 * @returns {undefined}
 */
function checkLimit(metricasData) {
    const limit = metricasData.query.limit;
    const totalRows = metricasData.data.length;
    if (limit < totalRows) {
        throw new Error(
            'rows limit exceeded: ' + limit + '(limit) < ' + totalRows + '(total_rows)',
        );
    }
}

/**
 * Normalize dimension
 * @param {Object} dimensionObj
 * @returns {Object}
 */
function prepareDimension(dimensionObj) {
    const keys = Object.keys(dimensionObj);

    switch (true) {
        case dimensionObj.id === undefined && dimensionObj.name === undefined:
            throw new Error('id and name properties are undefined, please report to developers.');
        case dimensionObj.id === undefined && dimensionObj.name !== undefined:
            dimensionObj.id = dimensionObj.name;
            break;
        case dimensionObj.name === undefined && dimensionObj.id !== undefined:
            dimensionObj.name = dimensionObj.id;
    }

    keys.forEach((key) => {
        dimensionObj[key] = String(dimensionObj[key]);
    });

    return dimensionObj;
}

/**
 * Map data from Metric format to Stat format
 * @param {Object} metrikasData
 * @returns {Object}
 */
function buildSimpleStatFormatData(metrikasData) {
    let localMetrikasData = metrikasData;

    if (metrikasData && !(metrikasData instanceof Object)) {
        localMetrikasData = JSON.parse(metrikasData);
    }

    checkLimit(localMetrikasData);

    const query = localMetrikasData.query;
    const data = localMetrikasData.data;
    const metrics = query.metrics;

    const indexDateDimension = checkDimensions(localMetrikasData);
    if (indexDateDimension === -1) {
        throw new Error('no scale in dimensions');
    }

    const group = /startOf(.*)/.exec(localMetrikasData.query.dimensions[indexDateDimension]);
    const categories = prepareDatesMs(
        query.date1,
        query.date2,
        group && group[1] && group[1].toLowerCase(),
    );
    const graphs = {};
    const sequences = [];

    function addValueToGraph(value, time) {
        if (!graphs[value.title]) {
            graphs[value.title] = [];
        }

        graphs[value.title].push({graph: value, time: time});

        const condition = sequences.some((graph) => {
            return value.title === graph.title;
        });

        if (!condition) {
            sequences.push({
                data: [],
                title: value.title,
                fname: value.fname,
                sname: value.sname,
            });
        }
    }

    function buildSequences() {
        const graphsNames = Object.keys(graphs);
        categories.forEach((category) => {
            sequences.forEach((sequence) => {
                graphsNames.some((graphName) => {
                    if (sequence.title === graphName) {
                        const graph = graphs[graphName];
                        const condition = graph.some((value) => {
                            if (value.time === category) {
                                sequence.data = sequence.data.concat(value.graph.data);
                                return true;
                            } else {
                                return false;
                            }
                        });

                        if (!condition) {
                            sequence.data.push(null);
                        }

                        return true;
                    } else {
                        return false;
                    }
                });
            });
        });
        return sequences;
    }

    data.forEach((valueObj) => {
        const dimensions = valueObj.dimensions
            .filter((dimensionObj, index) => index !== indexDateDimension)
            .map(prepareDimension);

        const title = dimensions.map((dimensionObj) => dimensionObj.name).join(', ');
        const fname = dimensions
            .map((dimensionObj) => [dimensionObj.id, dimensionObj.name].join(':'))
            .join('&');
        const sname = dimensions.map((dimensionObj) => dimensionObj.id).join('&');
        const time = moment.utc(valueObj.dimensions[indexDateDimension].name).valueOf();

        metrics.forEach((metricName, metricIndex) => {
            const lastPartOfMetricName = metricName.split(':').pop();
            const graph = {
                data: [valueObj.metrics[metricIndex]],
                title: title ? [title, metricName].join(' ::: ') : metricName,
                fname: fname ? [fname, lastPartOfMetricName].join('&') : lastPartOfMetricName,
                sname: sname ? [sname, lastPartOfMetricName].join('&') : lastPartOfMetricName,
            };
            addValueToGraph(graph, time);
        });
    });

    if (!data.length) {
        metrics.forEach((metricName) => {
            const lastPartOfMetricName = metricName.split(':').pop();

            const graph = {
                data: [],
                title: metricName,
                fname: lastPartOfMetricName,
                sname: lastPartOfMetricName,
            };
            addValueToGraph(graph, '');
        });
    }

    return {
        graphs: buildSequences(),
        categories_ms: categories,
    };
}

/**
 * Map data from Metric format to Stat format
 * @param {Object} metrikasData
 * @returns {Array}
 */
function buildRawStatFormatData(metrikasData) {
    let localMetrikasData = metrikasData;
    if (metrikasData && !(metrikasData instanceof Object)) {
        localMetrikasData = JSON.parse(metrikasData);
    }

    checkLimit(localMetrikasData);

    const query = localMetrikasData.query;
    const data = localMetrikasData.data;

    if (!(query instanceof Object) || !Array.isArray(data)) {
        throw new Error('data is not valid for the reformatting as statdata');
    }

    const queryMetrics = query.metrics;
    const queryDimensions = query.dimensions;
    const indexDateDimension = checkDimensions(localMetrikasData);
    const result = [];

    data.forEach((valueObj) => {
        const rawDimensions = valueObj.dimensions;

        rawDimensions
            .filter((dimension, index) => {
                return index !== indexDateDimension;
            })
            .forEach((dimensionObj) => prepareDimension(dimensionObj));

        const row = {};

        if (query.ids) {
            row.ids = query.ids;
        }

        if (indexDateDimension !== -1) {
            row.fielddate = rawDimensions[indexDateDimension].name;
            row.fielddate__ms = moment(rawDimensions[indexDateDimension].name).valueOf();
        }

        rawDimensions.forEach((dimension, index) => {
            if (index !== indexDateDimension) {
                row[queryDimensions[index]] = dimension.id;
                row[queryDimensions[index] + '_override_by_dictionary'] = dimension.name;
            }
        });

        queryMetrics.forEach((metricName, metricIndex) => {
            row[metricName] = valueObj.metrics[metricIndex];
        });

        result.push(row);
    });

    return {values: result};
}

function switchStatFormatter(formatValue, value, debugInfo) {
    let newValue = value;

    switch (formatValue) {
        case '1':
        case 'simple':
            newValue = buildSimpleStatFormatData(value);
            break;
        case 'raw':
            newValue = buildRawStatFormatData(value);
            break;
    }

    if (newValue && newValue instanceof Object) {
        newValue.debugInfo = [debugInfo];
    }

    return newValue;
}

function fixDateInterval(url) {
    const regexp = /(date_min|date_max)=([^&]*)/g;

    const metrikaDateTransform = {
        date_min: 'date1',
        date_max: 'date2',
    };

    return url.replace(regexp, (matcher, param1, param2) => {
        const replacedParam2 = param2.match(/[0-9-]*/)[0];

        return `${metrikaDateTransform[param1]}=${replacedParam2}`;
    });
}

function format(data, requestOptions) {
    const availableMetrikaValues = ['1', 'simple', 'raw'];

    const spStatFormat = requestOptions.spStatFormat || null;

    const isMetrikaNeedBuild = availableMetrikaValues.indexOf(spStatFormat) !== -1;

    return switchStatFormatter(isMetrikaNeedBuild ? spStatFormat : null, data);
}

module.exports = {
    fixDateInterval,
    format,
};
