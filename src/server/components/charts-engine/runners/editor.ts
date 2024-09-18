import type {AppContext} from '@gravity-ui/nodekit';

import type {DashWidgetConfig} from '../../../../shared';
import {Feature, getServerFeatures, isEnabledServerFeature} from '../../../../shared';
import {getIsolatedSandboxChartBuilder} from '../components/processor/isolated-sandbox/isolated-sandbox-chart-builder';

import {commonRunner} from './common';
import {runServerlessEditor} from './serverlessEditor';

import type {RunnerHandlerProps} from '.';

async function getChartBuilder({
    parentContext,
    userLang,
    userLogin,
    widgetConfig,
    config,
    isScreenshoter,
    chartsEngine,
}: {
    parentContext: AppContext;
    userLang: string;
    userLogin: string;
    chartsEngine: RunnerHandlerProps['chartsEngine'];
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    config: RunnerHandlerProps['config'];
    isScreenshoter: boolean;
}) {
    const serverFeatures = getServerFeatures(parentContext);
    const chartBuilder = await getIsolatedSandboxChartBuilder({
        userLang,
        userLogin,
        widgetConfig,
        config,
        isScreenshoter,
        chartsEngine,
        serverFeatures,
    });

    return {chartBuilder};
}

export const runEditor = async (
    parentContext: AppContext,
    runnerHandlerProps: RunnerHandlerProps,
) => {
    const enableServerlessEditor = Boolean(
        isEnabledServerFeature(parentContext, Feature.EnableServerlessEditor),
    );

    if (!runnerHandlerProps.isWizard && enableServerlessEditor) {
        return runServerlessEditor(parentContext, runnerHandlerProps);
    }

    const {chartsEngine, req, res, config, configResolving, workbookId, forbiddenFields} =
        runnerHandlerProps;
    const ctx = parentContext.create('editorChartRunner');

    const hrStart = process.hrtime();

    const {widgetConfig} = req.body;

    const {chartBuilder} = await getChartBuilder({
        parentContext,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        chartsEngine,
    });

    commonRunner({
        res,
        req,
        ctx,
        chartsEngine,
        configResolving,
        builder: chartBuilder,
        generatedConfig: config,
        workbookId,
        runnerType: 'Editor',
        hrStart,
        subrequestHeadersKind: 'editor',
        forbiddenFields,
    });
};
