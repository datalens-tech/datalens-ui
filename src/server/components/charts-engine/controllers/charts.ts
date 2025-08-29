import type {Request, Response} from '@gravity-ui/expresskit';

import type {ChartsEngine} from '..';
import {EntryUpdateMode} from '../../../../shared';
import {DeveloperModeCheckStatus} from '../../../../shared/types';
import Utils from '../../../utils';
import type {ChartTemplates} from '../components/chart-generator';
import {chartGenerator} from '../components/chart-generator';
import {chartValidator as validator} from '../components/chart-validator';
import type {
    ProviderCreateParams,
    ProviderUpdateParams,
} from '../components/storage/united-storage/provider';
import {USProvider} from '../components/storage/united-storage/provider';

type ErrorWithStatusAndData = Error & {response?: {status: number; data: string}} & {
    status?: number;
};

function responseWithError({
    error,
    defaultMessage,
    req,
    res,
}: {
    error: ErrorWithStatusAndData;
    defaultMessage: string;
    req: Request;
    res: Response;
}) {
    const {ctx} = req;
    let readableError: unknown = {error: defaultMessage};

    const {response} = error;
    let status = 500;

    if (response) {
        if (response.data) {
            readableError = response.data;
        }

        status = response.status;
    }

    ctx.logError('FAILED_TO_HANDLE_CHART', error);

    res.status(status).send(readableError);
}

export type ChartDataOptions = {
    data: {type?: string; convert?: boolean};
    template?: keyof ChartTemplates;
    type: string;
};

export function prepareChartData({data, template, type}: ChartDataOptions, req: Request) {
    const {ctx} = req;

    let chart, links;

    try {
        if (typeof template !== 'undefined') {
            ({chart, type, links} = chartGenerator.generateChart({data, template, req, ctx}));

            // Convert from wizard to editor script
            if (data.convert) {
                type = type.replace(/_wizard/, '');
            } else {
                chart = {shared: chart.shared};
            }
        } else if (type) {
            if (validator.validate({data, type})) {
                chart = data;
            } else {
                throw new Error('Cannot create chart: invalid tabs for specified type');
            }
        } else {
            throw new Error('Cannot create chart: template/type required in body');
        }
    } catch (error) {
        ctx.logError('FAILED_TO_PREPARE_CHART_DATA', error);
        return {error: error as Error};
    }

    return {chart, type, links, template};
}

const getHeaders = (req: Request) => {
    const headers = {
        ...req.headers,
        ...(req.ctx.config.isZitadelEnabled ? {...Utils.pickZitadelHeaders(req)} : {}),
        ...(req.ctx.config.isAuthEnabled ? {...Utils.pickAuthHeaders(req)} : {}),
    };

    return headers;
};

export const prepareCreateParams = async (
    chartData: ReturnType<typeof prepareChartData>,
    req: Request,
) => {
    const {chart, type, links, template} = chartData;
    const {key, name, workbookId, description} = req.body;

    // If we save editor script
    if (typeof template === 'undefined') {
        const {checkRequestForDeveloperModeAccess} = req.ctx.get('gateway');

        const checkResult = await checkRequestForDeveloperModeAccess({ctx: req.ctx});

        if (checkResult === DeveloperModeCheckStatus.Forbidden) {
            return;
        }
    }

    const createParams: ProviderCreateParams = {
        key,
        name,
        workbookId,
        data: chart,
        type,
        scope: 'widget',
        headers: getHeaders(req),
        includePermissionsInfo: true,
        description,
    };

    if (links) {
        createParams.links = links;
    }

    return createParams;
};

export const chartsController = (_chartsEngine: ChartsEngine) => {
    return {
        create: async (req: Request, res: Response) => {
            const {ctx} = req;

            const chartData = prepareChartData(req.body, req);

            if (chartData.error) {
                res.status(400).send({
                    error: chartData.error.message,
                });
                return;
            }

            const createParams = await prepareCreateParams(chartData, req);

            if (!createParams) {
                res.status(403).send({
                    error: {
                        code: 403,
                        details: {
                            message: 'Access to Editor developer mode was denied',
                        },
                    },
                });
                return;
            }

            USProvider.create(ctx, createParams)
                .then((result) => {
                    res.send({
                        ...result,
                    });
                })
                .catch((error) => {
                    responseWithError({
                        error,
                        defaultMessage: 'Failed to create chart',
                        req,
                        res,
                    });
                });
        },
        update: async (req: Request, res: Response) => {
            const {ctx} = req;

            const chartData = prepareChartData(req.body, req);

            if (chartData.error) {
                res.status(400).send({
                    error: chartData.error.message,
                });
                return;
            }
            const {chart, type, links, template} = chartData;

            // If we save editor script
            if (typeof template === 'undefined') {
                const {checkRequestForDeveloperModeAccess} = req.ctx.get('gateway');

                const checkResult = await checkRequestForDeveloperModeAccess({ctx: req.ctx});

                if (checkResult === DeveloperModeCheckStatus.Forbidden) {
                    res.status(403).send({
                        error: {
                            code: 403,
                            details: {
                                message: 'Access to Editor developer mode was denied',
                            },
                        },
                    });
                    return;
                }
            }

            const entryId = req.params.entryId;

            const {mode, description} = req.body;

            const updateParams: ProviderUpdateParams = {
                entryId,
                mode,
                type,
                data: chart,
                headers: getHeaders(req),
                description,
            };

            if (links) {
                updateParams.links = links;
            }

            if (mode !== EntryUpdateMode.Publish) {
                updateParams.skipSyncLinks = true;
            }

            USProvider.update(ctx, updateParams)
                .then((result) => {
                    res.send({
                        ...result,
                    });
                })
                .catch((error) => {
                    responseWithError({
                        error,
                        defaultMessage: 'Failed to update chart',
                        req,
                        res,
                    });
                });
        },
        get: (req: Request, res: Response) => {
            const {ctx} = req;
            const {entryId} = req.params;

            const {unreleased, includeLinks, includePermissionsInfo, revId} = req.query;

            USProvider.retrieveById(ctx, {
                id: entryId,
                revId: revId as string,
                unreleased: unreleased as string,
                includeLinks: includeLinks as string,
                includePermissionsInfo: includePermissionsInfo as string,
                headers: getHeaders(req),
            })
                .then((result) => {
                    let chartData;

                    if (result.type.includes('wizard_node')) {
                        try {
                            chartData = JSON.parse(result.data.shared);
                        } catch (e) {
                            chartData = {};
                        }
                    } else {
                        chartData = result.data;
                    }

                    result.data = chartData;

                    res.send(result);
                })
                .catch((error) => {
                    responseWithError({
                        error,
                        defaultMessage: 'Failed to get chart',
                        req,
                        res,
                    });
                });
        },
        delete: (req: Request, res: Response) => {
            const {ctx} = req;
            const entryId = req.params.entryId;

            USProvider.delete(ctx, {
                id: entryId,
                headers: getHeaders(req),
            })
                .then(() => {
                    res.status(200).send();
                })
                .catch((error) => {
                    responseWithError({
                        error,
                        defaultMessage: 'Failed to delete chart',
                        req,
                        res,
                    });
                });
        },
        entryByKey: (req: Request, res: Response) => {
            const {ctx} = req;
            const key = (req.query.key as string) || '';

            USProvider.retrieveByKey(ctx, {
                key,
                unreleased: true,
                headers: getHeaders(req),
            })
                .then((result) => {
                    res.send(result);
                })
                .catch((error) => {
                    responseWithError({
                        error,
                        defaultMessage: 'Failed to retrieve entry by key',
                        req,
                        res,
                    });
                });
        },
    };
};
