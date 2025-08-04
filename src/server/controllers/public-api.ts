import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';
import z from 'zod/v4';

import {getValidationSchema, hasValidationSchema} from '../../shared/schema/gateway-utils';
import {openApiRegistry} from '../components/app-docs';
import {PUBLIC_API_RPC_ERROR_CODE} from '../constants/public-api';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {PublicApiRpcMap} from '../types/public-api';
import Utils from '../utils';

const proxyMap: PublicApiRpcMap = {
    v0: {
        // navigation
        getNavigationList: {
            resolve: (api) => api.mix.getNavigationList,
            openApi: {
                summary: 'Get navigation list',
                tags: ['navigation'],
            },
        },
        // dataset
        getDataset: {
            resolve: (api) => api.bi.getDatasetApi,
            openApi: {
                summary: 'Get dataset',
                tags: ['dataset'],
            },
        },
        updateDataset: {
            resolve: (api) => api.bi.updateDatasetApi,
            openApi: {
                summary: 'Update dataset',
                tags: ['dataset'],
            },
        },
        createDataset: {
            resolve: (api) => api.bi.createDatasetApi,
            openApi: {
                summary: 'Create dataset',
                tags: ['dataset'],
            },
        },
        deleteDataset: {
            resolve: (api) => api.bi.deleteDatasetApi,
            openApi: {
                summary: 'Delete dataset',
                tags: ['dataset'],
            },
        },
        // wizard
        getWizardChart: {
            resolve: (api) => api.mix.getWizardChartApi,
            openApi: {
                summary: 'Get wizard chart',
                tags: ['wizard'],
            },
        },
        updateWizardChart: {
            resolve: (api) => api.bi.updateDataset,
            openApi: {
                summary: 'Delete wizard chart',
                tags: ['wizard'],
            },
        },
        createWizardChart: {
            resolve: (api) => api.bi.createDataset,
            openApi: {
                summary: 'Create wizard chart',
                tags: ['wizard'],
            },
        },
        deleteWizardChart: {
            resolve: (api) => api.mix.deleteWizardChartApi,
            openApi: {
                summary: 'Delete wizard chart',
                tags: ['wizard'],
            },
        },
        // Dash
        getDashboard: {
            resolve: (api) => api.mix.getDashboardApi,
            openApi: {
                summary: 'Get dashboard',
                tags: ['dashboard'],
            },
        },
        updateDashboard: {
            resolve: (api) => api.mix.updateDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: ['dashboard'],
            },
        },
        createDashboard: {
            resolve: (api) => api.mix.createDashboardApi,
            openApi: {
                summary: 'Create dashboard',
                tags: ['dashboard'],
            },
        },
        deleteDashboard: {
            resolve: (api) => api.mix.deleteDashboardApi,
            openApi: {
                summary: 'Delete dashboard',
                tags: ['dashboard'],
            },
        },
        // Report
        // getReport: {
        //     resolve: (api) => api.bi.createDataset,
        //     openApi: {
        //         summary: 'Get report',
        //         tags: ['report'],
        //     },
        // },
        // updateReport: {
        //     resolve: (api) => api.bi.updateDataset,
        //     openApi: {
        //         summary: 'Delete report',
        //         tags: ['report'],
        //     },
        // },
        // createReport: {
        //     resolve: (api) => api.bi.createDataset,
        //     openApi: {
        //         summary: 'Create report',
        //         tags: ['report'],
        //     },
        // },
        // deleteReport: {
        //     resolve: (api) => api.bi.deleteDataset,
        //     openApi: {
        //         summary: 'Delete report',
        //         tags: ['report'],
        //     },
        // },
    },
};

const handleError = (req: Request, res: Response, status: number, message: string) => {
    res.status(status).send({
        status,
        code: PUBLIC_API_RPC_ERROR_CODE,
        message,
        requestId: req.ctx.get(REQUEST_ID_PARAM_NAME) || '',
    });
};

const parseRoute = (route: string) => {
    const spacerIndex = route.indexOf(' ');
    const method = route.slice(0, spacerIndex).trim();
    const url = route.slice(spacerIndex).trim();

    return {
        method,
        url,
        reverse: (props: {version: string; action: string}) => {
            return url.replace(':version', props.version).replace(':action', props.action);
        },
    };
};

const defaultSchema = {
    summary: 'Type not defined',
    request: {
        body: {
            content: {
                ['application/json']: {
                    schema: z.toJSONSchema(z.any()),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'TBD',
            content: {
                ['application/json']: {
                    schema: z.toJSONSchema(z.any()),
                },
            },
        },
    },
};

export function publicApiControllerGetter(
    gatewayProxyMap: PublicApiRpcMap = proxyMap,
    params: any,
) {
    const parsedRoute = parseRoute(params.route);
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    Object.entries(gatewayProxyMap).forEach(([version, actions]) => {
        Object.entries(actions).forEach(([action, {resolve, openApi}]) => {
            const gatewayApiAction = resolve(gatewayApi);

            if (hasValidationSchema(gatewayApiAction)) {
                openApiRegistry.registerPath({
                    method: parsedRoute.method.toLocaleLowerCase(),
                    path: parsedRoute.reverse({version, action}),
                    ...openApi,
                    ...getValidationSchema(gatewayApiAction)().getOpenApichema(),
                    security: [{['Access token']: []}],
                });
            } else {
                openApiRegistry.registerPath({
                    method: parsedRoute.method.toLocaleLowerCase(),
                    path: parsedRoute.reverse({version, action}),
                    ...openApi,
                    ...defaultSchema,
                    security: [{['Access token']: []}],
                } as any);
            }
        });
    });

    return async function publicApiController(req: Request, res: Response) {
        const boundeHandler = handleError.bind(null, req, res);

        if (!req.params.version || !req.params.action) {
            return boundeHandler(400, 'Invalid params, version or action are empty');
        }

        const version = req.params.version as keyof PublicApiRpcMap;
        if (!_.has(gatewayProxyMap, version)) {
            return boundeHandler(404, 'Version not found');
        }

        const versionMap = gatewayProxyMap[version];
        const actionName = req.params.action as keyof typeof versionMap;
        if (!_.has(gatewayProxyMap[version], req.params.action)) {
            return boundeHandler(404, 'Action not found');
        }

        try {
            const action = versionMap[actionName];
            const {ctx} = req;

            const initialHeaders = Utils.pickRpcHeaders(req);
            const headers = action.headers ? action.headers(req, initialHeaders) : initialHeaders;
            const args = action.args ? await action.args(req) : req.body;
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const result = await action.resolve(gatewayApi)({
                headers,
                args,
                ctx,
                requestId,
            });

            res.status(200).send(result.responseData);
        } catch (err) {
            const {error} = err as any;
            if (error) {
                res.status(typeof error.status === 'number' ? error.status : 500).send(error);
            } else {
                return boundeHandler(500, 'Unknown error');
            }
        }
    };
}
