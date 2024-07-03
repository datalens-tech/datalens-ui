import controlModule from '../../../../../../../modes/charts/plugins/control';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsControlV1`;

export const libsControlV1Interop: LibsInterop = {
    prepareAdapter: `{
        buildSources: (args) => JSON.parse(${NAMESPACE}_buildSources(JSON.stringify(args))),
        buildGraph: (args) => ${NAMESPACE}_buildGraph(JSON.stringify(args)),
        buildUI: (args) => JSON.parse(${NAMESPACE}_buildUI(JSON.stringify(args))),
        buildChartsConfig: () => ({}),
        buildHighchartsConfig: () => ({}),
    }`,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildSources>[0];
            const result = controlModule.buildSources(parsedArg);
            chartEditorApi.__setSharedData(parsedArg.shared);
            return JSON.stringify(result);
        });

        jail.setSync(`${NAMESPACE}_buildGraph`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildGraph>[0];
            parsedArg.ChartEditor = chartEditorApi;
            controlModule.buildGraph(parsedArg);
            chartEditorApi.__setSharedData(parsedArg.shared);
        });

        jail.setSync(`${NAMESPACE}_buildUI`, (arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildUI>[0];
            const result = controlModule.buildUI(parsedArg);
            chartEditorApi.__setSharedData(parsedArg.shared);
            return JSON.stringify(result);
        });

        return jail;
    },
};
