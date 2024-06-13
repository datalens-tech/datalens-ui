import {datalensModule} from '../../../../../../../modes/charts/plugins/datalens/module';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsDatalensV3`;

export const libsDatalensV3Interop: LibsInterop = {
    prepareAdapter: `{
        buildSources: (args) => JSON.parse(${NAMESPACE}_buildSources(JSON.stringify(args))),
        buildChartsConfig: (args) =>
            JSON.parse(${NAMESPACE}_buildChartsConfig(JSON.stringify(args))),
        buildGraph: (...args) => JSON.parse(${NAMESPACE}_buildGraph(JSON.stringify(args))),
        buildHighchartsConfig: (args) =>
            JSON.parse(${NAMESPACE}_buildHighchartsConfig(JSON.stringify(args))),
        buildD3Config: (args) =>
            JSON.parse(${NAMESPACE}_buildD3Config(JSON.stringify(args))),
    }`,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildSources>[0];
            const result = datalensModule.buildSources(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildChartsConfig`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<
                typeof datalensModule.buildChartsConfig
            >[0];
            const result = datalensModule.buildChartsConfig(parsedArg, {});
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildGraph`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildGraph>[0];
            if ('shared' in parsedArg[0]) {
                parsedArg[0].ChartEditor = chartEditorApi;
            } else {
                parsedArg[2] = chartEditorApi;
            }

            const result = datalensModule.buildGraph(...parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildHighchartsConfig`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<
                typeof datalensModule.buildHighchartsConfig
            >[0];
            const result = datalensModule.buildHighchartsConfig(parsedArg);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildD3Config`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildD3Config>[0];
            const result = datalensModule.buildD3Config(parsedArg);
            return JSON.stringify(result);
        });
        return jail;
    },
};
