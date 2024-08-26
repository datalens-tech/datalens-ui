import type {AppContext} from '@gravity-ui/nodekit';

import {ControlType, Feature, isEnabledServerFeature} from '../../../../shared';
import {getControlBuilder} from '../components/processor/control-builder';
import type {ResolvedConfig} from '../components/storage/types';

import {runChart} from './chart';
import {commonRunner} from './utils';

import type {RunnerHandler, RunnerHandlerProps} from '.';

export const runControl: RunnerHandler = async (cx: AppContext, props: RunnerHandlerProps) => {
    if (!isEnabledServerFeature(cx, Feature.ControlBuilder)) {
        return runChart(cx, props);
    }

    const {chartsEngine, req, res, config, configResolving, workbookId} = props;

    const ctx = cx.create('templateControlRunner');

    if (
        !config ||
        !('data' in config) ||
        !('shared' in config.data) ||
        config.meta?.stype !== ControlType.Dash
    ) {
        const error = new Error('CONTROL_RUNNER_CONFIG_MISSING');
        ctx.logError('CONTROL_RUNNER_CONFIG_MISSING', error);
        ctx.end();

        return res.status(400).send({
            error,
        });
    }

    const generatedConfig = {
        data: {
            js: '',
            documentation_en: '',
            documentation_ru: '',
            ui: '',
            url: '',
            graph: '',
            params: '',
            statface_graph: '',
            shared: config.data.shared,
        },
        meta: {
            stype: ControlType.Dash,
        },
        publicAuthor: config.publicAuthor,
    } as ResolvedConfig;

    const hrStart = process.hrtime();

    const controlBuilder = await getControlBuilder({
        config: generatedConfig,
    });

    return commonRunner({
        res,
        req,
        ctx,
        chartsEngine,
        configResolving,
        builder: controlBuilder,
        generatedConfig,
        workbookId,
        runnerType: 'Control',
        hrStart,
        localConfig: config,
    });
};
