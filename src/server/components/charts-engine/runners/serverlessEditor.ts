import {AppContext} from '@gravity-ui/nodekit';
import axios from 'axios';
import {isObject} from 'lodash';

import Utils from '../../../utils';
import {ProcessorParams} from '../components/processor';
import {getDuration} from '../components/utils';

import {RunnerHandlerProps} from '.';

const YANDEX_FUNCTIONS_URL = process.env.YANDEX_FUNCTIONS_URL;
const YANDEX_FUNCTIONS_API_KEY = process.env.YANDEX_FUNCTIONS_API_KEY;

export const runServerlessEditor = (
    parentContext: AppContext,
    {chartsEngine, req, res, config, configResolving, workbookId}: RunnerHandlerProps,
) => {
    const ctx = parentContext.create('editorChartRunner');

    const hrStart = process.hrtime();

    const {params, actionParams, widgetConfig} = req.body;

    const iamToken = res?.locals?.iamToken ?? req.headers[ctx.config.headersMap.subjectToken];

    const processorParams: Omit<ProcessorParams, 'ctx' | 'builder' | 'hooks'> = {
        chartsEngine,
        paramsOverride: params,
        actionParamsOverride: actionParams,
        widgetConfig,
        userLang: res.locals && res.locals.lang,
        userLogin: res.locals && res.locals.login,
        userId: res.locals && res.locals.userId,
        subrequestHeaders: res.locals.subrequestHeaders,
        req,
        iamToken,
        isEditMode: Boolean(res.locals.editMode),
        configResolving,
        cacheToken: req.headers['x-charts-cache-token'] || null,
    };

    if (req.body.unreleased === 1) {
        processorParams.useUnreleasedConfig = true;
    }

    if (config) {
        processorParams.configOverride = config;
    }

    if (workbookId) {
        processorParams.workbookId = workbookId;
    }

    if (req.body.uiOnly) {
        processorParams.uiOnly = true;
    }

    processorParams.responseOptions = req.body.responseOptions || {};

    if (
        processorParams.responseOptions &&
        typeof processorParams.responseOptions.includeLogs === 'undefined'
    ) {
        processorParams.responseOptions.includeLogs = true;
    }

    ctx.log('ServerlessEditorRunner::PreRun', {duration: getDuration(hrStart)});

    if (!YANDEX_FUNCTIONS_URL || !YANDEX_FUNCTIONS_API_KEY) {
        ctx.logError('No Yandex functions url or api key');
        ctx.end();
        res.status(500).send('Internal error');
        return;
    }

    ctx.call('engineProcessing', (cx) => {
        const json = JSON.stringify(req.body);
        return axios
            .post(YANDEX_FUNCTIONS_URL, json, {
                headers: {
                    Authorization: `Api-Key ${YANDEX_FUNCTIONS_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((result) => {
                cx.log('ServerlessEditorRunner::FullRun', {duration: getDuration(hrStart)});

                if (result && result.data) {
                    const {processResult} = result.data;

                    if ('error' in processResult) {
                        const resultCopy = {...processResult};

                        if ('_confStorageConfig' in resultCopy) {
                            delete resultCopy._confStorageConfig;
                        }

                        cx.log('PROCESSED_WITH_ERRORS', {error: processResult.error});

                        let statusCode = 500;

                        if (isObject(processResult.error) && processResult.error.statusCode) {
                            statusCode = processResult.error.statusCode;

                            delete processResult.error.statusCode;
                        }

                        res.status(statusCode).send(result.data.processResult);
                    } else {
                        cx.log('PROCESSED_SUCCESSFULLY');

                        res.status(200).send(result.data.processResult);
                    }
                } else {
                    throw new Error('INVALID_PROCESSING_RESULT');
                }
            })
            .catch((error) => {
                const message = Utils.getErrorMessage(error);

                cx.logError('PROCESSING_FAILED', new Error(message));
                const result = {
                    error: {
                        code: 'ERR.CHARTS.UNHANDLED_ERROR',
                        debug: {
                            message,
                        },
                    },
                };
                res.status(500).send(result);
            })
            .finally(() => {
                ctx.end();
            });
    }).catch((error) => {
        ctx.logError('CHARTS_ENGINE_PROCESSOR_UNHANDLED_ERROR', error);
        ctx.end();
        res.status(500).send('Internal error');
    });
};
