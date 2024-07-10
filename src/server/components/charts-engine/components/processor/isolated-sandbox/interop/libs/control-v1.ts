import fs from 'fs';
import path from 'path';

import controlModule from '../../../../../../../modes/charts/plugins/control';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsControlV1`;

export type LibsControlV1BuildSources = (arg: string) => string;
export type LibsControlV1BuildGraph = (arg: string) => undefined;
export type LibsControlV1BuildUI = (arg: string) => string;

const prepare = fs.readFileSync(path.join(__dirname, 'control-v1-prepare.js'), 'utf-8');

export const libsControlV1Interop: LibsInterop = {
    prepareAdapter: prepare,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildSources>[0];
            const result = controlModule.buildSources(parsedArg);
            const shared = chartEditorApi.getSharedData();
            Object.assign(shared, parsedArg.shared);
            return JSON.stringify(result);
        }) satisfies LibsControlV1BuildSources);

        jail.setSync(`${NAMESPACE}_buildGraph`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildGraph>[0];
            parsedArg.ChartEditor = chartEditorApi;
            controlModule.buildGraph(parsedArg);
            const shared = chartEditorApi.getSharedData();
            Object.assign(shared, parsedArg.shared);
        }) satisfies LibsControlV1BuildGraph);

        jail.setSync(`${NAMESPACE}_buildUI`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof controlModule.buildUI>[0];
            const result = controlModule.buildUI(parsedArg);
            const shared = chartEditorApi.getSharedData();
            Object.assign(shared, parsedArg.shared);
            return JSON.stringify(result);
        }) satisfies LibsControlV1BuildUI);

        return jail;
    },
};
