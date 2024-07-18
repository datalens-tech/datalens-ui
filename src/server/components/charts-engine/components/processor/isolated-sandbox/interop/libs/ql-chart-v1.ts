import fs from 'fs';
import path from 'path';

import qlModule from '../../../../../../../modes/charts/plugins/ql/module';
import functionTimeout from '../../function-timeout';
import {JS_EXECUTION_TIMEOUT} from '../../isolated-sandbox-chart-builder';

import type {LibsInterop} from './types';

const NAMESPACE = `__libsQlChartV1`;

export type LibsQlChartV1BuildSources = (arg: string) => string;
export type LibsQlChartV1BuildGraph = (arg: string, number: number) => string;
export type LibsQlChartV1BuildLibraryConfig = (arg: string, number: number) => string;
export type LibsQlChartV1BuildChartsConfig = (arg: string, number: number) => string;
export type LibsQlChartV1BuildD3Config = (arg: string, number: number) => string;

const prepare = fs.readFileSync(path.join(__dirname, 'ql-chart-v1-prepare.js'), 'utf-8');

export const libsQlChartV1Interop: LibsInterop = {
    prepareAdapter: prepare,
    setPrivateApi: ({jail, chartEditorApi}) => {
        jail.setSync(`${NAMESPACE}_buildSources`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildSources>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = qlModule.buildSources(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsQlChartV1BuildSources);

        jail.setSync(`${NAMESPACE}_buildGraph`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildGraph>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = functionTimeout(qlModule.buildGraph, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsQlChartV1BuildGraph);

        jail.setSync(`${NAMESPACE}_buildLibraryConfig`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildLibraryConfig>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = functionTimeout(qlModule.buildLibraryConfig, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsQlChartV1BuildLibraryConfig);

        jail.setSync(`${NAMESPACE}_buildChartsConfig`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildChartsConfig>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = functionTimeout(qlModule.buildChartsConfig, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsQlChartV1BuildChartsConfig);

        jail.setSync(`${NAMESPACE}_buildD3Config`, ((arg: string) => {
            const parsedArg = JSON.parse(arg) as Parameters<typeof qlModule.buildD3Config>[0];
            parsedArg.ChartEditor = chartEditorApi;
            const result = functionTimeout(qlModule.buildD3Config, {
                timeout: JS_EXECUTION_TIMEOUT,
            })(parsedArg);
            return JSON.stringify(result);
        }) satisfies LibsQlChartV1BuildD3Config);

        return jail;
    },
};
