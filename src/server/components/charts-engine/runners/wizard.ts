import path from 'path';

import {type AppContext, USER_LANGUAGE_PARAM_NAME} from '@gravity-ui/nodekit';
import type {Pool, Proxy, WorkerPoolOptions} from 'workerpool';
import workerpool from 'workerpool';

import {getWizardChartBuilder} from '../components/processor/worker-chart-builder';
import type {ResolvedConfig} from '../components/storage/types';
import type {WizardWorker} from '../components/wizard-worker/types';

import {resolveRunnerLocals} from './common';
import {runWorkerChart} from './worker';

import type {RunnerHandler, RunnerHandlerProps} from './index';

let wizardWorkersPool: Pool | null = null;
async function getWizardWorker(options?: WorkerPoolOptions): Promise<Proxy<WizardWorker>> {
    if (wizardWorkersPool === null) {
        const scriptPath = path.resolve(__dirname, '../components/wizard-worker');
        wizardWorkersPool = workerpool.pool(scriptPath, options);
    }

    return wizardWorkersPool.proxy<WizardWorker>();
}

export const runWizardChart: RunnerHandler = async (cx: AppContext, props: RunnerHandlerProps) => {
    const {req, runnerLocals, resLocals, config} = props;
    const locals = resolveRunnerLocals({runnerLocals, resLocals});
    const timeouts = cx.config.runnerExecutionTimeouts?.wizard;
    const {widgetConfig} = req.body;

    const chartBuilder = await getWizardChartBuilder({
        userLang: cx.get(USER_LANGUAGE_PARAM_NAME) || '',
        userLogin: locals.login || '',
        widgetConfig,
        config: config as ResolvedConfig,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        worker: await getWizardWorker({
            maxWorkers: cx.config.chartsEngineConfig.maxWorkers ?? 1,
        }),
        timeouts,
        tenantSettings: {defaultColorPaletteId: config.tenantSettings?.defaultColorPaletteId},
    });

    return runWorkerChart(cx, {...props, chartBuilder, runnerType: 'Wizard'});
};
