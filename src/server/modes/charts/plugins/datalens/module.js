const buildChartsConfig = require('./config').default;
const buildD3Config = require('./d3').buildWizardD3Config;
const buildHighchartsConfig = require('./highcharts').default;
const buildGraph = require('./js/js');
const buildSources = require('./url/build-sources').default;
const {setConsole} = require('./utils/misc-helpers');

module.exports = {
    buildHighchartsConfig,
    buildSources,
    buildGraph,
    buildChartsConfig,
    buildD3Config,
    setConsole,
};
