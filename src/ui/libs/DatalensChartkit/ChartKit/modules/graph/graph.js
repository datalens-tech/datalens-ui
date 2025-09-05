import {drawComments} from '../comments/drawing';
import {initHighcharts} from '../highcharts/highcharts';

import {prepareConfig} from './config/config';
import {prepareData} from './prepare-data';

import './graph.scss';

// CHARTS-5293#62742a063019347e74157c5b
let highchartsInitialized = false;

function getGraph(options, data, comments, isMobile) {
    if (!highchartsInitialized) {
        highchartsInitialized = true;
        initHighcharts({isMobile});
    }

    prepareData(data, options);

    return {
        // TODO: think about how to correct comments, maybe you should do it right after the api/run
        // TODO: to submit ready-made data to the rendering
        config: {
            _externalComments: (!options.disableExternalComments && comments) || [],
            _internalComments: data.comments || [],
            ...prepareConfig(data, options, isMobile),
        },
        callback: (chart) => {
            if (!chart) {
                console.error('CHARTKIT_NO_CHART_CALLBACK');
                return null;
            }

            chart.userOptions._getComments = () =>
                chart.userOptions._internalComments.concat(chart.userOptions._externalComments);

            let needRedraw = false;

            chart.series.forEach((serie) => {
                // Optimization that allows not to run through all data points to search for null
                // if this work has already been done on the script side
                // for example, it is used in monitoring with a large amount of data
                if (serie.userOptions.noCheckNullValues) {
                    return;
                }

                if (
                    ['line', 'spline', 'area', 'stack'].includes(serie.type) &&
                    !serie.options.connectNulls
                ) {
                    const {data} = serie;
                    data.forEach((point, index) => {
                        // draw a marker if there is a current value, but there is no next and previous one
                        if (
                            point.y !== null &&
                            // the analog of index === 0, but for cases when the array is not filled with 0
                            (data[index - 1] === undefined ||
                                // eslint-disable-next-line eqeqeq, no-eq-null
                                data[index - 1].y == null) &&
                            // eslint-disable-next-line eqeqeq, no-eq-null
                            (index === data.length - 1 || data[index + 1].y == null)
                        ) {
                            point.update({marker: {enabled: true}}, false, false);
                            needRedraw = true;
                        }
                    });
                }
            });

            if (options.highstock) {
                let extmin;
                let extmax;

                if (options.extremes && options.extremes.min && options.extremes.max) {
                    extmin = options.extremes.min;
                    extmax = options.extremes.max;
                } else if (options.highstock.range_min && options.highstock.range_max) {
                    extmin = parseInt(
                        options.highstock.override_range_min || options.highstock.range_min,
                        10,
                    );
                    extmax = parseInt(
                        options.highstock.override_range_max || options.highstock.range_max,
                        10,
                    );
                }

                if (extmin && extmax) {
                    // https://github.com/highcharts/highcharts/issues/9028
                    const xAxis =
                        chart.xAxis.find(
                            (xAxis) => !chart.navigator || xAxis !== chart.navigator.xAxis,
                        ) || chart.navigator.xAxis;
                    extmin = Math.max(chart.xAxis[0].dataMin, extmin);
                    extmax = Math.min(chart.xAxis[0].dataMax, extmax);
                    // TODO: xAxis.setExtremes(extmin, extmax, false, false);
                    xAxis.setExtremes(extmin, extmax, false, false);
                    needRedraw = true;
                }
            }

            // For the correct rendering of the chart in the case when the range limit is set in the navigator
            // (that is, xAxis.setExtremes is called) and there are comments (drawComments is called), it is necessary that between
            // calls to xAxis.setExtremes and drawComments caused the chart redraw
            if (needRedraw) {
                chart.redraw();
            }

            if (chart && chart.userOptions._getComments()) {
                // TODO: return needRedraw
                drawComments(chart, chart.userOptions._getComments(), chart.userOptions._config);
            }

            chart.userOptions.isCallbackCalled = true;
        },
    };
}

export {getGraph};
