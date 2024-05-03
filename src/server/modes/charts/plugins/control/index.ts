import {buildUI} from './controls';
import {buildGraph} from './js';
import {buildSources} from './url';

export default {
    // Url
    buildSources,
    // JavaScript
    buildGraph,
    // Controls
    buildUI,
    // Config
    buildChartsConfig: () => {
        return {};
    },
    // Highcharts
    buildHighchartsConfig: () => {
        return {};
    },
};
