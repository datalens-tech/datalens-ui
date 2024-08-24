import type {StringParams} from '../../../../../shared';
import {buildUI} from '../../../../modes/charts/plugins/control/controls';
import {buildGraph} from '../../../../modes/charts/plugins/control/js';
import type {ControlShared} from '../../../../modes/charts/plugins/control/types';
import {buildSources} from '../../../../modes/charts/plugins/control/url';

import {getControlApiContext} from './control-api-context';
import type {ControlBuilder} from './types';

type ControlBuilderArgs = {
    config: {
        data: {
            shared: string;
        };
    };
};

export const getControlBuilder = async (args: ControlBuilderArgs): Promise<ControlBuilder> => {
    const {config} = args;
    let shared: ControlShared;

    // Nothing happens here - just for compatibility with the editor
    const emptyStep = (name: string) => async (options: {params: StringParams}) => {
        const {params} = options;
        const timeStart = process.hrtime();
        const context = getControlApiContext({
            name,
            shared,
            params,
        });

        return {
            exports: {},
            executionTiming: process.hrtime(timeStart),
            name,
            runtimeMetadata: context.__runtimeMetadata,
        };
    };

    const controlBuilder: ControlBuilder = {
        builderType: 'control',
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
            const context = getControlApiContext({
                name: 'Params',
                shared,
                params,
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

            const context = getControlApiContext({
                name: 'Urls',
                shared,
                params,
            });

            return {
                exports: buildSources({
                    shared,
                    params,
                }),
                executionTiming: process.hrtime(timeStart),
                name: 'Urls',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },

        buildChartLibraryConfig: emptyStep('Highcharts'),

        buildChartConfig: emptyStep('Config'),

        buildChart: async (options) => {
            const {data, params} = options;
            const timeStart = process.hrtime();

            const context = getControlApiContext({
                name: 'JavaScript',
                shared,
                params,
            });

            buildGraph({
                data,
                shared,
                params,
                ChartEditor: context.ChartEditor,
            });
            return {
                exports: {},
                executionTiming: process.hrtime(timeStart),
                name: 'JavaScript',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },

        buildUI: async (options) => {
            const {params} = options;
            const timeStart = process.hrtime();

            const context = getControlApiContext({
                name: 'UI',
                shared: shared,
                params: params,
            });

            return {
                exports: buildUI({
                    shared: shared,
                }),
                executionTiming: process.hrtime(timeStart),
                name: 'UI',
                runtimeMetadata: context.__runtimeMetadata,
            };
        },
        dispose: () => {},
    };

    return controlBuilder;
};
