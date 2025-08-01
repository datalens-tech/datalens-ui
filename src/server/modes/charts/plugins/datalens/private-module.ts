import {buildChartsConfigPrivate} from './config/config';
import {buildHighchartsConfigPrivate} from './highcharts/highcharts';
import {buildGraphPrivate} from './js/js';
import {buildSourcesPrivate} from './url/build-sources/build-sources';
import {setConsole} from './utils/misc-helpers';

export const datalensModule = {
    buildHighchartsConfig: buildHighchartsConfigPrivate,
    buildSources: buildSourcesPrivate,
    buildGraph: buildGraphPrivate,
    buildChartsConfig: buildChartsConfigPrivate,
    setConsole,
};
