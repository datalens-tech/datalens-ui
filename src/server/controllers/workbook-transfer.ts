import type {Request, Response} from '@gravity-ui/expresskit';

import type {DashEntry, TransferIdMapping, TransferNotification} from '../../shared';
import {EntryScope, ErrorCode} from '../../shared';
import {Utils} from '../components';
import {Dash} from '../components/sdk';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

type ExportRequestBody = {
    entryId: string;
    idMapping: TransferIdMapping;
    workbookId: string;
};

type ExportSuccessResponseBody = {
    data: object;
    notifications: TransferNotification[];
};

type ExportErrorResponseBody = {
    code: string;
};

type ExportResponseBody = ExportSuccessResponseBody | ExportErrorResponseBody;

type ImportRequestBody = {
    data: object;
    workbookId: string;
    idMapping: TransferIdMapping;
    scope: EntryScope;
};

type ImportSuccessResponseBody = {
    entryId?: string;
    notifications: TransferNotification[];
};

type ImportErrorResponseBody = {
    code: string;
};

type ImportResponseBody = ImportSuccessResponseBody | ImportErrorResponseBody;

export const workbooksTransferController = {
    export: async (req: Request<{}, {}, ExportRequestBody>, res: Response<ExportResponseBody>) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.status(403).send({
                    code: ErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {entryId, idMapping, workbookId} = req.body;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            const {responseData: entry} = await gatewayApi.us._proxyGetEntry({
                headers,
                args: {
                    entryId,
                    workbookId,
                    usMasterToken,
                },
                ctx,
                requestId: req.id,
            });
            const scope = entry.scope;

            switch (scope) {
                case EntryScope.Dash: {
                    const result = await Dash.prepareExport(
                        entry as unknown as DashEntry,
                        idMapping,
                    );

                    res.status(200).send({
                        data: result.dash.data,
                        notifications: result.notifications,
                    });
                    break;
                }
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._proxyExportConnection({
                        headers,
                        args: {
                            connectionId: entryId,
                            id_mapping: idMapping,
                            workbookId,
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send({
                        data: responseData.connection,
                        notifications: responseData.notifications,
                    });
                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._proxyExportDataset({
                        headers,
                        args: {
                            datasetId: entryId,
                            id_mapping: idMapping,
                            workbookId,
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send({
                        data: responseData.dataset,
                        notifications: responseData.notifications,
                    });
                    break;
                }
                default: {
                    res.status(400).send({
                        code: ErrorCode.TransferInvalidEntryScope,
                    });
                    break;
                }
            }
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error.status).send(error);
        }
    },
    import: async (req: Request<{}, {}, ImportRequestBody>, res: Response<ImportResponseBody>) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.status(403).send({
                    code: ErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {data, idMapping, scope, workbookId} = req.body;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            switch (scope) {
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._proxyImportConnection({
                        headers,
                        args: {
                            data: {
                                workbook_id: workbookId,
                                connection: data as Record<string, unknown>,
                            },
                            id_mapping: idMapping,
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send({
                        entryId: responseData.id,
                        notifications: responseData.notifications,
                    });

                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._proxyImportDataset({
                        headers,
                        args: {
                            data: {
                                workbook_id: workbookId,
                                dataset: data as Record<string, unknown>,
                            },
                            id_mapping: idMapping,
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send({
                        entryId: responseData.id,
                        notifications: responseData.notifications,
                    });

                    break;
                }
                case EntryScope.Dash: {
                    const {dash, notifications} = await Dash.prepareImport({
                        dash: data as {data: DashEntry['data']; name: string},
                        id_mapping: idMapping,
                    });

                    const {responseData} = await gatewayApi.us._proxyCreateEntry({
                        headers,
                        args: {
                            workbookId: workbookId,
                            ...(dash as any),
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send({
                        entryId: responseData.entryId,
                        notifications,
                    });

                    break;
                }
                default: {
                    res.status(400).send({
                        code: ErrorCode.TransferInvalidEntryScope,
                    });
                    break;
                }
            }
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error.status).send(error);
        }
    },
};
