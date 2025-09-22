import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import type {DashEntry, TransferNotification} from '../../shared';
import {EntryScope} from '../../shared';
import {TransferCapabilities, TransferErrorCode} from '../../shared/constants/workbook-transfer';
import {sharedRegistry} from '../../shared/registry';
import type {EntryFieldData, EntryFieldLinks} from '../../shared/schema';
import {Utils} from '../components';
import {Dash} from '../components/sdk';
import {
    prepareExportChartData,
    prepareImportChartData,
} from '../components/workbook-transfer/charts';
import {
    criticalTransferNotification,
    warningTransferNotification,
} from '../components/workbook-transfer/create-transfer-notifications';
import {prepareDashExportData, prepareDashImportData} from '../components/workbook-transfer/dash';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

export const createExportResponseData = (
    notifications: TransferNotification[] = [],
    entryData: Record<string, unknown> | null = null,
) => {
    return {
        notifications,
        entryData,
    };
};

export const createImportResponseData = (
    notifications: TransferNotification[] = [],
    id: string | null = null,
) => {
    return {
        id,
        notifications,
    };
};

export const sendResponse = (
    res: Response,
    data: ReturnType<typeof createExportResponseData | typeof createImportResponseData>,
) => {
    res.status(200).send(data);
};

const getRequestId = (ctx: Request['ctx']) => ctx.get(REQUEST_ID_PARAM_NAME) || '';

export const proxyGetEntry = async (
    req: Request,
    res: Response,
    args: {
        workbookId: string | null;
        entryId: string;
    },
) => {
    const {ctx} = req;
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    const headers = {
        ...Utils.pickHeaders(req),
    };
    const requestId = getRequestId(ctx);

    const {getAuthArgsProxyBiPrivate} = sharedRegistry.gatewayAuth.functions.getAll();
    const authArgs = getAuthArgsProxyBiPrivate(req, res);

    try {
        return await gatewayApi.usPrivate._proxyGetEntry({
            headers,
            args: {
                ...args,
                branch: 'published',
            },
            authArgs,
            ctx,
            requestId,
        });
    } catch (ex) {
        const {error} = ex as GatewayApiErrorResponse;

        // If failed to find published entry, at least take current saved
        if (error.status === 404) {
            return gatewayApi.usPrivate._proxyGetEntry({
                headers,
                args,
                authArgs,
                ctx,
                requestId,
            });
        }

        throw ex;
    }
};

const resolveScopeForEntryData = (entryData: Record<keyof EntryScope, unknown>) => {
    return Object.values(EntryScope).find((key) => key in entryData);
};

export const prepareExportData = async (req: Request, res: Response) => {
    const {ctx} = req;
    const headers = {
        ...Utils.pickHeaders(req),
    };

    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const {exportId, scope, idMapping} = req.body;
    const workbookId = (req.body?.workbookId as string) ?? null;

    const {getAuthArgsProxyBiPrivate} = sharedRegistry.gatewayAuth.functions.getAll();

    switch (scope) {
        case EntryScope.Dash: {
            const {responseData: entry} = await proxyGetEntry(req, res, {
                entryId: exportId,
                workbookId,
            });

            if (entry.scope !== scope) {
                return createExportResponseData([
                    criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
                ]);
            }

            const {dash, notifications} = await prepareDashExportData(
                Dash.migrateDescription(entry as unknown as DashEntry),
                idMapping,
            );

            return createExportResponseData(notifications, {
                dash,
            });
        }
        case EntryScope.Widget: {
            const {responseData: entry} = await proxyGetEntry(req, res, {
                entryId: exportId,
                workbookId,
            });

            if (entry.scope !== scope) {
                return createExportResponseData([
                    criticalTransferNotification(TransferErrorCode.TransferInvalidEntryData),
                ]);
            }

            const {widget, notifications} = await prepareExportChartData(entry, idMapping);

            return createExportResponseData(notifications, {widget});
        }
        case EntryScope.Connection: {
            const {responseData} = await gatewayApi.bi._proxyExportConnection({
                headers,
                args: {
                    connectionId: exportId,
                    workbookId,
                },
                authArgs: getAuthArgsProxyBiPrivate(req, res),
                ctx,
                requestId: getRequestId(ctx),
            });

            return createExportResponseData(responseData.notifications, {
                connection: responseData.connection,
            });
        }
        case EntryScope.Dataset: {
            const {responseData} = await gatewayApi.bi._proxyExportDataset({
                headers,
                args: {
                    datasetId: exportId,
                    idMapping,
                    workbookId,
                },
                authArgs: getAuthArgsProxyBiPrivate(req, res),
                ctx,
                requestId: getRequestId(ctx),
            });

            return createExportResponseData(responseData.notifications, {
                dataset: responseData.dataset,
            });
        }
        default: {
            return createExportResponseData([
                criticalTransferNotification(TransferErrorCode.TransferInvalidEntryScope),
            ]);
        }
    }
};

export const prepareImportData = async (req: Request, res: Response) => {
    const {ctx} = req;
    const headers = {
        ...Utils.pickHeaders(req),
    };

    const {idMapping = {}, entryData = {}, workbookId} = req.body;
    const scope = resolveScopeForEntryData(entryData);

    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    const {getAuthArgsProxyBiPrivate, getAuthArgsProxyUSPrivate} =
        sharedRegistry.gatewayAuth.functions.getAll();

    switch (scope) {
        case EntryScope.Connection: {
            const {responseData} = await gatewayApi.bi._proxyImportConnection({
                headers,
                args: {
                    workbookId,
                    connection: entryData.connection,
                },
                ctx,
                requestId: getRequestId(ctx),
                authArgs: getAuthArgsProxyBiPrivate(req, res),
            });

            return createImportResponseData(responseData.notifications, responseData.id);
        }
        case EntryScope.Dataset: {
            const {responseData} = await gatewayApi.bi._proxyImportDataset({
                headers,
                args: {
                    workbookId,
                    dataset: entryData.dataset,
                    idMapping,
                },
                ctx,
                requestId: getRequestId(ctx),
                authArgs: getAuthArgsProxyBiPrivate(req, res),
            });

            return createImportResponseData(responseData.notifications, responseData.id);
        }
        case EntryScope.Widget: {
            const {widget, notifications} = await prepareImportChartData(
                entryData.widget,
                req,
                idMapping,
            );

            if (!widget) {
                return createImportResponseData(notifications);
            }

            const {responseData} = await gatewayApi.usPrivate._proxyCreateEntry({
                headers: {
                    ...headers,
                    metadata: ctx.getMetadata(),
                },
                args: {
                    workbookId,
                    data: widget.data as EntryFieldData,
                    key: widget.key,
                    name: widget.name,
                    type: widget.type,
                    scope: widget.scope,
                    mode: widget.mode,
                    links: widget.links as EntryFieldLinks,
                    annotation: widget.annotation,
                },
                ctx,
                authArgs: getAuthArgsProxyUSPrivate(req, res),
                requestId: getRequestId(ctx),
            });

            return createImportResponseData(notifications, responseData.entryId);
        }
        case EntryScope.Dash: {
            const {dash, notifications} = await prepareDashImportData(entryData.dash, idMapping);

            if (!dash) {
                return createImportResponseData(notifications);
            }

            const {data, annotation} = Dash.migrateDescription(dash);

            const {responseData} = await gatewayApi.usPrivate._proxyCreateEntry({
                headers,
                args: {
                    workbookId,
                    data: data as unknown as EntryFieldData,
                    key: dash.key,
                    name: dash.name,
                    type: dash.type,
                    scope: dash.scope,
                    mode: dash.mode,
                    links: dash.links,
                    annotation: {
                        description: annotation?.description ?? '',
                    },
                },
                ctx,
                authArgs: getAuthArgsProxyUSPrivate(req, res),
                requestId: getRequestId(ctx),
            });

            return createImportResponseData(notifications, responseData.entryId);
        }
        default: {
            return createImportResponseData([
                warningTransferNotification(TransferErrorCode.TransferInvalidEntryScope),
            ]);
        }
    }
};

export const workbooksTransferController = {
    capabilities: async (_: Request, res: Response) => {
        res.status(200).send(TransferCapabilities);
    },
    export: async (req: Request, res: Response) => {
        try {
            const {hasValidWorkbookTransferAuthHeaders} =
                sharedRegistry.gatewayAuth.functions.getAll();

            if (!(await hasValidWorkbookTransferAuthHeaders(req))) {
                res.status(403).send({
                    code: TransferErrorCode.TransferInvalidToken,
                });
                return;
            }

            sendResponse(res, await prepareExportData(req, res));
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error?.status || 500).send(error);
        }
    },
    import: async (req: Request, res: Response) => {
        try {
            const {hasValidWorkbookTransferAuthHeaders} =
                sharedRegistry.gatewayAuth.functions.getAll();

            if (!(await hasValidWorkbookTransferAuthHeaders(req))) {
                res.status(403).send({
                    code: TransferErrorCode.TransferInvalidToken,
                });
                return;
            }

            sendResponse(res, await prepareImportData(req, res));
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error?.status || 500).send(error);
        }
    },
};
