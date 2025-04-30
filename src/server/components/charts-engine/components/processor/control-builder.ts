import type {StringParams} from '../../../../../shared';
import {buildUI} from '../../../../modes/charts/plugins/control/controls';
import {buildGraph} from '../../../../modes/charts/plugins/control/js';
import type {SourceResponseData} from '../../../../modes/charts/plugins/control/js/types';
import type {ControlShared} from '../../../../modes/charts/plugins/control/types';
import {buildSources} from '../../../../modes/charts/plugins/control/url';

import {getChartApiContext} from './chart-api-context';
import type {ChartBuilder} from './types';

type ChartBuilderArgs = {
    config: {
        data: {
            shared: string;
        };
    };
};

export const getControlBuilder = async (args: ChartBuilderArgs): Promise<ChartBuilder> => {
    const {config} = args;
    let shared: ControlShared;

    // Nothing happens here - just for compatibility with the editor
    const emptyStep = (name: string) => async (options: {params: StringParams}) => {
        const {params} = options;
        const timeStart = process.hrtime();
        const context = getChartApiContext({
            name,
            shared,
            params,
            actionParams: {} as Record<string, string | string[]>,
            userLang: null,
        });

        return {
            exports: {},
            executionTiming: process.hrtime(timeStart),
            name,
            runtimeMetadata: context.__runtimeMetadata,
        };
    };

    const ChartBuilder: ChartBuilder = {
        type: 'CONTROL',
        buildShared: async () => {
            if (typeof config.data.shared === 'string') {
                shared = JSON.parse(config.data.shared);
            } else {
                shared = config.data.shared;
            }
        },
        buildModules: async () => {
            return {};
        },
        buildParams: async (options) => {
            const {params} = options;
            const timeStart = process.hrtime();
            const context = getChartApiContext({
                name: 'Params',
                shared,
                params,
                actionParams: {} as Record<string, string | string[]>,
                userLang: null,
            });
            return {
                exports: {},
                executionTiming: process.hrtime(timeStart),
                name: 'Params',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },
        buildUrls: async (options) => {
            const {params} = options;
            const timeStart = process.hrtime();

            const context = getChartApiContext({
                name: 'Sources',
                shared,
                params,
                actionParams: {} as Record<string, string | string[]>,
                userLang: null,
            });

            return {
                exports: buildSources({
                    shared,
                    params,
                }),
                executionTiming: process.hrtime(timeStart),
                name: 'Sources',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },

        buildChartLibraryConfig: emptyStep('Highcharts'),

        buildChartConfig: emptyStep('Config'),

        buildChart: async (options) => {
            const {data, params} = options;
            const timeStart = process.hrtime();

            const context = getChartApiContext({
                name: 'Prepare',
                shared,
                params,
                actionParams: {} as Record<string, string | string[]>,
                userLang: null,
            });

            buildGraph({
                data: data as unknown as SourceResponseData,
                shared,
                params,
                ChartEditor: context.ChartEditor,
            });

            return {
                exports: {},
                executionTiming: process.hrtime(timeStart),
                name: 'Prepare',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },

        buildUI: async (options) => {
            const {params} = options;
            const timeStart = process.hrtime();

            const context = getChartApiContext({
                name: 'Controls',
                shared: shared,
                params: params,
                actionParams: {} as Record<string, string | string[]>,
                userLang: null,
            });

            return {
                exports: buildUI({
                    shared: shared,
                }),
                executionTiming: process.hrtime(timeStart),
                name: 'Controls',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },
        dispose: () => {},
    };

    return ChartBuilder;
};
