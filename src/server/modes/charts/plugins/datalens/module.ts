import {buildChartsConfig} from './config';
import {buildWizardD3Config as buildD3Config} from './gravity-charts';
import {buildHighchartsConfig} from './highcharts';
import {buildGraph} from './js';
import {buildSources} from './url/build-sources';
import {setConsole} from './utils/misc-helpers';

export const datalensModule = {
    buildHighchartsConfig,
    buildSources,
    buildGraph,
    buildChartsConfig,
    buildD3Config,
    setConsole,
};
