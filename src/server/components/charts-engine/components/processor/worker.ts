import workerpool from 'workerpool';

import {Shared} from '../../../../../shared';
// import {
//     buildChartsConfig,
//     buildD3Config,
//     buildGraph,
//     buildHighchartsConfig,
//     // buildSources,
// } from '../../../../modes/charts/plugins/datalens/module';
import {buildSourcesPrivate} from '../../../../modes/charts/plugins/datalens/url/build-sources';

import {getChartApiContext} from './sandbox';

workerpool.worker({
    buildSources: async (args: any) => {
        const {shared, params, actionParams, widgetConfig, userLang, features} = args;
        const timeStart = process.hrtime();

        const context = getChartApiContext({
            name: 'Urls',
            shared,
            params,
            actionParams,
            widgetConfig,
            userLang,
        });
        const result = buildSourcesPrivate({
            apiVersion: '2',
            shared: shared as Shared,
            params,
            ChartEditor: context.ChartEditor,
            features,
        });

        const executionTiming = process.hrtime(timeStart);

        return {
            exports: result,
            executionTiming,
            name: 'Urls',
            runtimeMetadata: context.__runtimeMetadata,
        };
    },
});
