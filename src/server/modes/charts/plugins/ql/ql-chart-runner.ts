import path from 'path';

import type {AppContext} from '@gravity-ui/nodekit';
import type {Pool, Proxy, WorkerPoolOptions} from 'workerpool';
import workerpool from 'workerpool';

import {getWizardChartBuilder} from '../../../../components/charts-engine/components/processor/worker-chart-builder';
import type {ResolvedConfig} from '../../../../components/charts-engine/components/storage/types';
import type {WizardWorker} from '../../../../components/charts-engine/components/wizard-worker/types';
import type {RunnerHandler, RunnerHandlerProps} from '../../../../components/charts-engine/runners';
import {runWorkerChart} from '../../../../components/charts-engine/runners/worker';
import {registry} from '../../../../registry';

import type {QLAdditionalData} from './types';

let wizardWorkersPool: Pool | null = null;
async function getQlWorker(options?: WorkerPoolOptions): Promise<Proxy<WizardWorker>> {
    if (wizardWorkersPool === null) {
        const scriptPath = path.resolve(__dirname, './worker');
        const additionalData: QLAdditionalData = {
            qlConnectionTypeMap: registry.getQLConnectionTypeMap(),
        };
        wizardWorkersPool = workerpool.pool(scriptPath, {
            ...options,
            workerThreadOpts: {workerData: additionalData},
        });
    }

    return wizardWorkersPool.proxy<WizardWorker>();
}

export const runQlChart: RunnerHandler = async (cx: AppContext, props: RunnerHandlerProps) => {
    const {req, res, config} = props;
    const {widgetConfig} = req.body;
    const chartBuilder = await getWizardChartBuilder({
        ctx: req.ctx,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config: config as ResolvedConfig,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        worker: await getQlWorker({
            maxWorkers: cx.config.chartsEngineConfig.maxWorkers ?? 1,
        }),
    });

    return runWorkerChart(cx, {...props, chartBuilder, runnerType: 'Ql'});
};
