import path from 'path';

import type {AppContext} from '@gravity-ui/nodekit';
import type {Pool, Proxy} from 'workerpool';
import workerpool from 'workerpool';

import {Feature, isEnabledServerFeature} from '../../../../shared';
import {getWizardChartBuilder} from '../components/processor/worker-chart-builder';
import type {ResolvedConfig} from '../components/storage/types';
import type {WizardWorker} from '../components/wizard-worker/types';

import {runChart} from './chart';
import {runWorkerChart} from './worker';

import type {RunnerHandler, RunnerHandlerProps} from '.';

let wizardWorkersPool: Pool | null = null;
async function getWizardWorker(): Promise<Proxy<WizardWorker>> {
    if (wizardWorkersPool === null) {
        const scriptPath = path.resolve(__dirname, '../components/worker');
        wizardWorkersPool = workerpool.pool(scriptPath);
    }

    return wizardWorkersPool.proxy<WizardWorker>();
}

export const runWizardChart: RunnerHandler = async (cx: AppContext, props: RunnerHandlerProps) => {
    if (!isEnabledServerFeature(cx, Feature.WorkerChartBuilder)) {
        return runChart(cx, props);
    }

    const {req, res, config} = props;
    const {widgetConfig} = req.body;
    const chartBuilder = await getWizardChartBuilder({
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config: config as ResolvedConfig,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        worker: await getWizardWorker(),
    });

    return runWorkerChart(cx, {...props, chartBuilder, runnerType: 'Wizard'});
};
