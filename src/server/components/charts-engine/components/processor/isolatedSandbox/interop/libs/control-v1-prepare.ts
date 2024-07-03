import type controlModule from '../../../../../../../modes/charts/plugins/control';

import type {
    LibsControlV1BuildGraph,
    LibsControlV1BuildSources,
    LibsControlV1BuildUI,
} from './control-v1';

declare const __libsControlV1_buildSources: LibsControlV1BuildSources;
declare const __libsControlV1_buildGraph: LibsControlV1BuildGraph;
declare const __libsControlV1_buildUI: LibsControlV1BuildUI;

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const controlV1prepareAdapter: typeof controlModule = {
    buildSources: (args) => JSON.parse(__libsControlV1_buildSources(JSON.stringify(args))),
    buildGraph: (args) => __libsControlV1_buildGraph(JSON.stringify(args)),
    buildUI: (args) => JSON.parse(__libsControlV1_buildUI(JSON.stringify(args))),
    buildChartsConfig: () => ({}),
    buildHighchartsConfig: () => ({}),
};
