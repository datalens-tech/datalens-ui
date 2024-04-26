import {buildChartsConfig} from './config';
import {buildWizardD3Config as buildD3Config} from './d3';
import {buildGraph} from './js/js';
import {buildSources} from './url/build-sources';
import {setConsole} from './utils/misc-helpers';

export const datalensModule = {
    buildChartsConfig,
    buildD3Config,
    buildGraph,
    buildSources,
    setConsole,
};
