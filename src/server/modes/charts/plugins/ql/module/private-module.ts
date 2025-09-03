import {setConsole} from '../utils/misc-helpers';

import {buildChartConfig} from './config/build-chart-config';
import {buildGraph} from './js/build-graph';
import {buildLibraryConfig} from './library-config/build-library-config';
import {buildSources} from './url/build-sources';

export default {
    buildLibraryConfig,
    buildSources,
    buildGraph,
    buildChartConfig,
    setConsole,
};
