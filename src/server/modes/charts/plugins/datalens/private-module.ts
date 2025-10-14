import {buildChartsConfigPrivate} from './config';
import {buildHighchartsConfigPrivate} from './highcharts';
import {buildGraphPrivate} from './js/js';
import {buildSourcesPrivate} from './url/build-sources';
import {setConsole} from './utils/misc-helpers';

export const datalensModule = {
    buildHighchartsConfig: buildHighchartsConfigPrivate,
    buildSources: buildSourcesPrivate,
    buildGraph: buildGraphPrivate,
    buildChartsConfig: buildChartsConfigPrivate,
    setConsole,
};
