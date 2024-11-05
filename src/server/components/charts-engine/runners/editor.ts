import type {AppContext} from '@gravity-ui/nodekit';

import type {DashWidgetConfig} from '../../../../shared';
import {Feature, getServerFeatures, isEnabledServerFeature} from '../../../../shared';
import {getTranslationFn} from '../../../../shared/modules/language';
import {registry} from '../../../registry';
import {createI18nInstance} from '../../../utils/language';
import {getIsolatedSandboxChartBuilder} from '../components/processor/isolated-sandbox/isolated-sandbox-chart-builder';

import {commonRunner} from './common';
import {runServerlessEditor} from './serverlessEditor';

const DEFAULT_USER_LANG = 'ru';

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
    const i18n = createI18nInstance({lang: userLang});
    const getTranslation = getTranslationFn(i18n.getI18nServer());
    const serverFeatures = getServerFeatures(parentContext);
    const getAvailablePalettesMap = registry.common.functions.get('getAvailablePalettesMap');
    const getQLConnectionTypeMap = registry.getQLConnectionTypeMap;
    const chartBuilder = await getIsolatedSandboxChartBuilder({
        userLang,
        userLogin,
        widgetConfig,
        config,
        isScreenshoter,
        nativeModules: chartsEngine.nativeModules,
        serverFeatures,
        getTranslation,
        getAvailablePalettesMap,
        getQLConnectionTypeMap,
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

    const userLang = (res.locals && res.locals.lang) || DEFAULT_USER_LANG;

    const {chartBuilder} = await getChartBuilder({
        parentContext,
        userLang,
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
