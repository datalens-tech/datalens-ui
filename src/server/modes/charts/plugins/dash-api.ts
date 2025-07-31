import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import {REQUEST_ID_PARAM_NAME, USER_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import pick from 'lodash/pick';

import type {DashEntry, EntryReadParams} from '../../../../shared';
import {DASH_API_BASE_URL, EntryScope, ErrorCode} from '../../../../shared';
import {Utils} from '../../../components';
import type {Plugin, PluginRoute} from '../../../components/charts-engine/types';
import {Dash} from '../../../components/sdk';
import {DASH_ENTRY_RELEVANT_FIELDS} from '../../../constants';

function purgeResult(result: DashEntry) {
    return pick(result, DASH_ENTRY_RELEVANT_FIELDS);
}

type ConfiguredDashApiPluginOptions = {
    basePath?: string;
    privatePath?: string;
    /**
     * @deprecated use validationConfig instead
     */
    validate?: PluginRoute['validationConfig'];
    validationConfig?: PluginRoute['validationConfig'];
    routeParams?: Partial<Omit<PluginRoute, 'path' | 'method' | 'handler' | 'validate'>>;
    privateRouteParams?: Partial<Omit<PluginRoute, 'path' | 'method' | 'handler' | 'validate'>>;
};

const getRoutes = (options?: ConfiguredDashApiPluginOptions): Plugin['routes'] => {
    const {
        routeParams,
        privateRouteParams,
        validate,
        basePath = DASH_API_BASE_URL,
        privatePath,
    } = options || {};
    let {validationConfig} = options || {};

    if (validate && !validationConfig) {
        validationConfig = validate;
    }

    let routes: PluginRoute[] = [
        {
            method: 'POST',
            path: basePath,
            validationConfig,
            handlerName: 'dashAPIcreate',
            handler: async (req: Request, res: Response) => {
                try {
                    const {body, ctx} = req;
                    const I18n = req.ctx.get('i18n');

                    const result = await Dash.create(body, Utils.pickHeaders(req), ctx, I18n);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    const errorCode = Utils.getErrorCode(error);
                    const errorStatus = errorCode === ErrorCode.ReadOnlyMode ? 451 : 500;
                    res.status(errorStatus).send({
                        message: Utils.getErrorMessage(error),
                        details: Utils.getErrorDetails(error),
                        code: errorCode,
                    });
                    sendStat(req.ctx, 'create', errorStatus);
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'GET',
            path: `${basePath}/:id`,
            handlerName: 'dashAPIget',
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        query,
                        ctx,
                    } = req;

                    if (!id || id === 'null') {
                        res.status(404).send({message: 'Dash not found'});
                        sendStat(req.ctx, 'get', 404);
                        return;
                    }
                    const result = await Dash.read(
                        id,
                        query as unknown as EntryReadParams | null,
                        Utils.pickHeaders(req),
                        ctx,
                    );

                    if (result.scope !== EntryScope.Dash) {
                        res.status(404).send({message: 'No entry found'});
                        sendStat(req.ctx, 'get', 404);
                        return;
                    }

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    const originalStatus = Utils.getErrorStatus(error);

                    const errorStatus =
                        originalStatus && [400, 403, 404].includes(originalStatus)
                            ? originalStatus
                            : 500;
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                    sendStat(req.ctx, 'get', errorStatus);
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'POST',
            path: `${basePath}/:id`,
            handlerName: 'dashAPIupdate',
            validationConfig,
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        body,
                        ctx,
                    } = req;

                    const I18n = req.ctx.get('i18n');

                    const result = await Dash.update(id, body, Utils.pickHeaders(req), ctx, I18n);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    let errorStatus = 500;
                    if (Utils.getErrorStatus(error) === 403) {
                        errorStatus = 403;
                    } else if (Utils.getErrorCode(error) === ErrorCode.ReadOnlyMode) {
                        errorStatus = 451;
                    }
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                    sendStat(req.ctx, 'update', errorStatus);
                }
            },
            ...(routeParams || {}),
        },
        {
            method: 'DELETE',
            path: `${basePath}/:id`,
            handlerName: 'dashAPIdelete',
            handler: async (req: Request, res: Response) => {
                try {
                    const {
                        params: {id},
                        ctx,
                    } = req;

                    const result = await Dash.delete(id, Utils.pickHeaders(req), ctx);

                    res.status(200).send(purgeResult(result));
                } catch (error) {
                    let errorStatus = 500;
                    if (Utils.getErrorStatus(error) === 403) {
                        errorStatus = 403;
                    } else if (Utils.getErrorCode(error) === ErrorCode.ReadOnlyMode) {
                        errorStatus = 451;
                    }
                    res.status(errorStatus).send({message: Utils.getErrorMessage(error)});
                    sendStat(req.ctx, 'delete', errorStatus);
                }
            },
            ...(routeParams || {}),
        },
    ];

    if (privatePath) {
        routes = routes.concat(
            routes.map((route) => {
                return {
                    ...route,
                    path: route.path.replace(basePath, privatePath),
                    ...(privateRouteParams || {}),
                };
            }),
        );
    }

    return routes;
};

export function configuredDashApiPlugin(options?: ConfiguredDashApiPluginOptions): Plugin {
    return {
        routes: getRoutes(options),
    };
}

function sendStat(ctx: AppContext, handlerName: string, status: number) {
    ctx.stats('dashApiErrors', {
        handlerName,
        datetime: Date.now(),
        status,
        requestId: ctx.get(REQUEST_ID_PARAM_NAME) || '',
        userId: ctx.get(USER_ID_PARAM_NAME) || '',
    });
}
