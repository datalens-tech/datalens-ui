import fs from 'fs';
import path from 'path';

import {datalensModule} from '../../../../../../../modes/charts/plugins/datalens/module';
import functionTimeout from '../../function-timeout';
import {JS_EXECUTION_TIMEOUT} from '../../isolated-sandbox-chart-builder';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsDatalensV3`;
export type LibsDatalensV3BuildSources = (arg: string) => string;
export type LibsDatalensV3BuildChartsConfig = (arg: string) => string;
export type LibsDatalensV3BuildGraph = (arg: string) => string;
export type LibsDatalensV3BuildHighchartsConfig = (arg: string) => string;
export type LibsDatalensV3BuildD3Config = (arg: string) => string;

const prepare = fs.readFileSync(path.join(__dirname, 'datalens-v3-prepare.js'), 'utf-8');

export const libsDatalensV3Interop: LibsInterop = {
    prepareAdapter: prepare,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildSources>[0];
            const result = datalensModule.buildSources(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsDatalensV3BuildSources);

        jail.setSync(`${NAMESPACE}_buildChartsConfig`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<
                typeof datalensModule.buildChartsConfig
            >[0];
            const result = datalensModule.buildChartsConfig(parsedArg, {});
            return JSON.stringify(result);
        }) satisfies LibsDatalensV3BuildChartsConfig);

        jail.setSync(`${NAMESPACE}_buildGraph`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildGraph>[0];
            if ('shared' in parsedArg[0]) {
                parsedArg[0].ChartEditor = chartEditorApi;
            } else {
                parsedArg[2] = chartEditorApi;
            }

            // const result = datalensModule.buildGraph(...parsedArg);
            const result = functionTimeout(datalensModule.buildGraph, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsDatalensV3BuildGraph);

        jail.setSync(`${NAMESPACE}_buildHighchartsConfig`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<
                typeof datalensModule.buildHighchartsConfig
            >[0];
            const result = functionTimeout(datalensModule.buildHighchartsConfig, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsDatalensV3BuildHighchartsConfig);

        jail.setSync(`${NAMESPACE}_buildD3Config`, ((arg) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof datalensModule.buildD3Config>[0];
            const result = functionTimeout(datalensModule.buildD3Config, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsDatalensV3BuildD3Config);

        return jail;
    },
};
