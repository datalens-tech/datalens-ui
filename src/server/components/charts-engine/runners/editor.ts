import type {AppContext} from '@gravity-ui/nodekit';

import type {DashWidgetConfig} from '../../../../shared';
import {Feature, isEnabledServerFeature} from '../../../../shared';
import {getIsolatedSandboxChartBuilder} from '../components/processor/isolated-sandbox/isolated-sandbox-chart-builder';
import {getSandboxChartBuilder} from '../components/processor/sandbox-chart-builder';

import {commonRunner} from './common';
import {runServerlessEditor} from './serverlessEditor';

import type {RunnerHandlerProps} from '.';

const NEW_SANDBOX_PERCENT = {
    [Feature.NewSandbox_1p]: 0.01,
    [Feature.NewSandbox_10p]: 0.1,
    [Feature.NewSandbox_33p]: 0.33,
    [Feature.NewSandbox_50p]: 0.5,
    [Feature.NewSandbox_75p]: 0.75,
};

function isEnabledNewSandboxByDefault(ctx: AppContext) {
    if (isEnabledServerFeature(ctx, Feature.NewSandbox_100p)) {
        return true;
    }
    const features = Object.keys(NEW_SANDBOX_PERCENT);
    const feature = features.find((feat) => isEnabledServerFeature(ctx, feat as Feature));
    if (!feature) {
        return false;
    }
    const percent = NEW_SANDBOX_PERCENT[feature as keyof typeof NEW_SANDBOX_PERCENT];
    return Math.random() <= percent;
}

async function getChartBuilder({
    parentContext,
    userLang,
    userLogin,
    widgetConfig,
    config,
    isScreenshoter,
    chartsEngine,
    isWizard,
}: {
    parentContext: AppContext;
    userLang: string;
    userLogin: string;
    chartsEngine: RunnerHandlerProps['chartsEngine'];
    widgetConfig?: DashWidgetConfig['widgetConfig'];
    config: RunnerHandlerProps['config'];
    isScreenshoter: boolean;
    isWizard: boolean;
}) {
    let sandboxVersion = config.meta.sandbox_version || '0';

    if (sandboxVersion === '0') {
        sandboxVersion = isEnabledNewSandboxByDefault(parentContext) ? '2' : '1';
    }
    const enableIsolatedSandbox =
        Boolean(isEnabledServerFeature(parentContext, Feature.EnableIsolatedSandbox)) &&
        sandboxVersion === '2';

    const noJsonFn = Boolean(isEnabledServerFeature(parentContext, Feature.NoJsonFn));
    const chartBuilder =
        enableIsolatedSandbox && !isWizard
            ? await getIsolatedSandboxChartBuilder({
                  userLang,
                  userLogin,
                  widgetConfig,
                  config,
                  isScreenshoter,
                  chartsEngine,
                  features: {
                      noJsonFn,
                  },
              })
            : await getSandboxChartBuilder({
                  userLang,
                  userLogin,
                  widgetConfig,
                  config,
                  isScreenshoter,
                  chartsEngine,
              });

    return {chartBuilder, sandboxVersion: enableIsolatedSandbox ? 2 : 1};
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

    const {chartBuilder, sandboxVersion} = await getChartBuilder({
        parentContext,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        widgetConfig,
        config,
        isScreenshoter: Boolean(req.headers['x-charts-scr']),
        chartsEngine,
        isWizard: runnerHandlerProps.isWizard || false,
    });

    ctx.log(`EditorRunner::Sandbox version: ${sandboxVersion}`);

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
