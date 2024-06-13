import qlModule from '../../../../../../../modes/charts/plugins/ql/module';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsQlChartV1`;

export const libsQlChartV1Interop: LibsInterop = {
    prepareAdapter: `{
        buildSources: (args) => JSON.parse(${NAMESPACE}_buildSources(JSON.stringify(args))),
        buildGraph: (args) => JSON.parse(${NAMESPACE}_buildGraph(JSON.stringify(args))),
        buildChartsConfig: (args) =>
            JSON.parse(${NAMESPACE}_buildChartsConfig(JSON.stringify(args))),
        buildLibraryConfig: (args) =>
            JSON.parse(${NAMESPACE}_buildLibraryConfig(JSON.stringify(args))),
        buildD3Config: (args) => JSON.parse(${NAMESPACE}_buildD3Config(JSON.stringify(args))),
    }`,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildSources>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildSources(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildGraph`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildGraph>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildGraph(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildLibraryConfig`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildLibraryConfig>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildLibraryConfig(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildChartsConfig`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildChartsConfig>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildChartsConfig(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildD3Config`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildD3Config>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildD3Config(parsedArg);
            return JSON.stringify(result);
        });

        return jail;
    },
};
