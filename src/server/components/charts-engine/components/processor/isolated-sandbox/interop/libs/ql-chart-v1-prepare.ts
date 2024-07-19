import type qlModule from '../../../../../../../modes/charts/plugins/ql/module';

import type {
    LibsQlChartV1BuildChartsConfig,
    LibsQlChartV1BuildD3Config,
    LibsQlChartV1BuildGraph,
    LibsQlChartV1BuildLibraryConfig,
    LibsQlChartV1BuildSources,
} from './ql-chart-v1';

declare const __libsQlChartV1_buildSources: LibsQlChartV1BuildSources;
declare const __libsQlChartV1_buildGraph: LibsQlChartV1BuildGraph;
declare const __libsQlChartV1_buildChartsConfig: LibsQlChartV1BuildChartsConfig;
declare const __libsQlChartV1_buildLibraryConfig: LibsQlChartV1BuildLibraryConfig;
declare const __libsQlChartV1_buildD3Config: LibsQlChartV1BuildD3Config;
declare const __timeout: number;

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const qlChartV1prepareAdapter: typeof qlModule = {
    buildSources: (args) => JSON.parse(__libsQlChartV1_buildSources(JSON.stringify(args))),
    buildGraph: (args) => JSON.parse(__libsQlChartV1_buildGraph(JSON.stringify(args), __timeout)),
    buildChartsConfig: (args) =>
        JSON.parse(__libsQlChartV1_buildChartsConfig(JSON.stringify(args), __timeout)),
    buildLibraryConfig: (args) =>
        JSON.parse(__libsQlChartV1_buildLibraryConfig(JSON.stringify(args), __timeout)),
    buildD3Config: (args) =>
        JSON.parse(__libsQlChartV1_buildD3Config(JSON.stringify(args), __timeout)),
};
