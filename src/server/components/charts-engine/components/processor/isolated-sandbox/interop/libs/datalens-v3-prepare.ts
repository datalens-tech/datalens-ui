import type {datalensModule} from '../../../../../../../modes/charts/plugins/datalens/module';

import type {
    LibsDatalensV3BuildChartsConfig,
    LibsDatalensV3BuildD3Config,
    LibsDatalensV3BuildGraph,
    LibsDatalensV3BuildHighchartsConfig,
    LibsDatalensV3BuildSources,
} from './datalens-v3';

declare const __libsDatalensV3_buildSources: LibsDatalensV3BuildSources;
declare const __libsDatalensV3_buildChartsConfig: LibsDatalensV3BuildChartsConfig;
declare const __libsDatalensV3_buildGraph: LibsDatalensV3BuildGraph;
declare const __libsDatalensV3_buildHighchartsConfig: LibsDatalensV3BuildHighchartsConfig;
declare const __libsDatalensV3_buildD3Config: LibsDatalensV3BuildD3Config;
declare const __timeout: number;
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const datalensV3prepareAdapter: typeof datalensModule = {
    buildSources: (args) => JSON.parse(__libsDatalensV3_buildSources(JSON.stringify(args))),
    buildChartsConfig: (args) =>
        JSON.parse(__libsDatalensV3_buildChartsConfig(JSON.stringify(args), __timeout)),
    buildGraph: (...args) =>
        JSON.parse(__libsDatalensV3_buildGraph(JSON.stringify(args), __timeout)),
    buildHighchartsConfig: (args) =>
        JSON.parse(__libsDatalensV3_buildHighchartsConfig(JSON.stringify(args), __timeout)),
    buildD3Config: (args) =>
        JSON.parse(__libsDatalensV3_buildD3Config(JSON.stringify(args), __timeout)),
};
