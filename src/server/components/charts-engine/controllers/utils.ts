import type {Request} from '@gravity-ui/expresskit';
import isObject from 'lodash/isObject';

import type {StringParams} from '../../../../shared';
import Utils from '../../../utils';
import {resolveConfig} from '../components/storage';
import type {ResolveConfigError, ResolveConfigProps} from '../components/storage/base';

export function shouldUseUnreleasedConfig(args: {request: Request; params?: StringParams}) {
    const {request, params} = args;

    let useUnreleasedConfig = request.body.unreleased === '1';
    if (params) {
        if (Array.isArray(params.unreleased)) {
            useUnreleasedConfig = useUnreleasedConfig || params.unreleased[0] === '1';
        } else {
            useUnreleasedConfig = useUnreleasedConfig || params.unreleased === '1';
        }
    }

    return useUnreleasedConfig;
}

type LoadChartConfigArgs = {
    extraSettings?: any;
    subrequestHeaders?: any;
    request: Request;
    params?: StringParams;
    id?: string;
    key?: string;
    workbookId?: string;
};

export async function resolveChartConfig(args: LoadChartConfigArgs) {
    const {params, id, key, workbookId, request, extraSettings, subrequestHeaders} = args;
    const {ctx} = request;

    const configResolveArgs: ResolveConfigProps = {
        unreleased: shouldUseUnreleasedConfig({request, params}),
        key,
        id,
        workbookId,
        headers: {
            ...subrequestHeaders,
            ...ctx.getMetadata(),
            ...(ctx.config.isZitadelEnabled ? {...Utils.pickZitadelHeaders(request)} : {}),
        },
        requestId: request.id,
        ...extraSettings,
    };

    try {
        ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {key, id});
        return await ctx.call('configLoading', (cx) => resolveConfig(cx, configResolveArgs));
    } catch (err) {
        const error: ResolveConfigError =
            isObject(err) && 'message' in err ? (err as Error) : new Error(err as string);
        const result: {
            error: {
                code: string;
                details: {
                    code: number | null;
                    entryId?: string;
                };
                debug?: {
                    message: unknown;
                };
            };
        } = {
            error: {
                code: 'ERR.CHARTS.CONFIG_LOADING_ERROR',
                details: {
                    code: (error.response && error.response.status) || error.status || null,
                    entryId: id,
                },
                debug: {
                    message: error.message,
                },
            },
        };

        // TODO use ShowChartsEngineDebugInfo flag
        if (ctx.config.appInstallation !== 'internal') {
            delete result.error.debug;
        }

        ctx.logError(`CHARTS_ENGINE_CONFIG_LOADING_ERROR "${key || id}"`, error);

        return result;
    }
}
