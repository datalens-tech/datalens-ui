import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import type {DashEntry, TransferNotification} from '../../shared';
import {EntryScope} from '../../shared';
import {TransferErrorCode} from '../../shared/constants/workbook-transfer';
import type {EntryFieldData} from '../../shared/schema';
import {Utils} from '../components';
import {
    prepareExportChartData,
    prepareImportChartData,
} from '../components/workbook-transfer/charts';
import {criticalTransferNotification} from '../components/workbook-transfer/create-transfer-notifications';
import {prepareDashExportData, prepareDashImportData} from '../components/workbook-transfer/dash';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

const sendExportResponse = (
    res: Response,
    notifications: TransferNotification[] = [],
    entryData: Record<string, unknown> | null = null,
) => {
    res.status(200).send({
        entryData,
        notifications,
    });
};

const sendImportResponse = (
    res: Response,
    notifications: TransferNotification[] = [],
    id: string | null = null,
) => {
    res.status(200).send({
        id,
        notifications,
    });
};

const getRequestId = (ctx: Request['ctx']) => ctx.get(REQUEST_ID_PARAM_NAME) || '';

const getEntry = (
    req: Request,
    args: {
        usMasterToken: string;
        workbookId: string | null;
        entryId: string;
    },
) => {
    const {ctx} = req;
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const headers = {
        ...Utils.pickHeaders(req),
    };

    return gatewayApi.us._proxyGetEntry({
        headers,
        args,
        ctx,
        requestId: getRequestId(ctx),
    });
};

const resolveScopeForEntryData = (entryData: Record<keyof EntryScope, unknown>) => {
    return Object.values(EntryScope).find((key) => key in entryData);
};

export const workbooksExportController = {
    export: async (req: Request, res: Response) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.send(403).send({
                    code: TransferErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const {exportId, scope, idMapping} = req.body;
            const workbookId = (req.body?.workbookId as string) ?? null;

            switch (scope) {
                case EntryScope.Dash: {
                    const {responseData: entry} = await getEntry(req, {
                        entryId: exportId,
                        workbookId,
                        usMasterToken,
                    });

                    if (entry.scope !== scope) {
                        sendExportResponse(res, [
                            criticalTransferNotification(
                                TransferErrorCode.TransferInvalidEntryData,
                            ),
                        ]);
                        return;
                    }

                    const {dash, notifications} = await prepareDashExportData(
                        entry as unknown as DashEntry,
                        idMapping,
                    );

                    sendExportResponse(res, notifications, {
                        dash,
                    });
                    break;
                }
                case EntryScope.Widget: {
                    const {responseData: entry} = await getEntry(req, {
                        entryId: exportId,
                        workbookId,
                        usMasterToken,
                    });

                    if (entry.scope !== scope) {
                        sendExportResponse(res, [
                            criticalTransferNotification(
                                TransferErrorCode.TransferInvalidEntryData,
                            ),
                        ]);
                        return;
                    }

                    const {widget, notifications} = await prepareExportChartData(entry, idMapping);

                    sendExportResponse(res, notifications, {widget});
                    break;
                }
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._proxyExportConnection({
                        headers,
                        args: {
                            connectionId: exportId,
                            workbookId,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendExportResponse(res, responseData.notifications, {
                        connection: responseData.connection,
                    });
                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._proxyExportDataset({
                        headers,
                        args: {
                            datasetId: exportId,
                            idMapping,
                            workbookId,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendExportResponse(res, responseData.notifications, {
                        dataset: responseData.dataset,
                    });
                    break;
                }
                default: {
                    sendExportResponse(res, [
                        criticalTransferNotification(TransferErrorCode.TransferInvalidEntryScope),
                    ]);
                    break;
                }
            }
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error?.status || 500).send(error);
        }
    },
    import: async (req: Request, res: Response) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.send(403).send({
                    code: TransferErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {idMapping = {}, entryData = {}, workbookId} = req.body;
            const scope = resolveScopeForEntryData(entryData);

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            switch (scope) {
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._proxyImportConnection({
                        headers,
                        args: {
                            workbookId,
                            connection: entryData.connection,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendImportResponse(res, responseData.notifications, responseData.id);
                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._proxyImportDataset({
                        headers,
                        args: {
                            workbookId,
                            dataset: entryData.dataset,
                            idMapping,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendImportResponse(res, responseData.notifications, responseData.id);
                    break;
                }
                case EntryScope.Widget: {
                    const {widget, notifications} = await prepareImportChartData(
                        entryData.widget,
                        req,
                        idMapping,
                    );

                    if (!widget) {
                        sendImportResponse(res, notifications);
                        return;
                    }

                    const {responseData} = await gatewayApi.us._proxyCreateEntry({
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
                            links: widget.links,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendImportResponse(res, notifications, responseData.entryId);
                    break;
                }
                case EntryScope.Dash: {
                    const {dash, notifications} = await prepareDashImportData(
                        entryData.dash,
                        idMapping,
                    );

                    if (!dash) {
                        sendImportResponse(res, notifications);
                        return;
                    }

                    const {responseData} = await gatewayApi.us._proxyCreateEntry({
                        headers,
                        args: {
                            workbookId,
                            data: dash.data as unknown as EntryFieldData,
                            key: dash.key,
                            name: dash.name,
                            type: dash.type,
                            scope: dash.scope,
                            mode: dash.mode,
                            links: dash.links,
                            usMasterToken,
                        },
                        ctx,
                        requestId: getRequestId(ctx),
                    });

                    sendImportResponse(res, notifications, responseData.entryId);
                    break;
                }
                default: {
                    sendImportResponse(res, [
                        criticalTransferNotification(TransferErrorCode.TransferInvalidEntryScope),
                    ]);
                    break;
                }
            }
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error?.status || 500).send(error);
        }
    },
};
