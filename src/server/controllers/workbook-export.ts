import type {Request, Response} from '@gravity-ui/expresskit';

import type {DashEntry} from '../../shared';
import {EntryScope, ErrorCode} from '../../shared';
import {Utils} from '../components';
import {Dash} from '../components/sdk';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

export const workbooksExportController = {
    export: async (req: Request, res: Response) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };

            const {exportId, id_mapping} = req.body;
            const workbookId = (req.body?.workbookId as string) ?? null;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const {responseData: entry} = await gatewayApi.us._getEntry({
                headers,
                args: {
                    entryId: exportId,
                    workbookId,
                },
                ctx,
                requestId: req.id,
            });

            switch (entry.scope) {
                case EntryScope.Dash: {
                    const result = await Dash.prepareExport(
                        entry as unknown as DashEntry,
                        id_mapping,
                    );

                    res.status(200).send(result);
                    break;
                }
                case EntryScope.Widget: {
                    // {type, data} = entry; {template} = data.type;
                    res.status(200).send(entry);
                    break;
                }
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._exportConnection({
                        headers,
                        args: {
                            connectionId: exportId,
                            id_mapping,
                            workbookId,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send(responseData);
                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._exportDataset({
                        headers,
                        args: {
                            datasetId: exportId,
                            id_mapping,
                            workbookId,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send(responseData);
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
    import: async (req: Request, res: Response) => {
        try {
            const {ctx} = req;
            const headers = {
                ...Utils.pickHeaders(req),
            };

            const {data, id_mapping} = req.body;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            if (data.connection) {
                const {responseData} = await gatewayApi.bi._importConnection({
                    headers,
                    args: {
                        data,
                        id_mapping,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send(responseData);
            } else if (data.dataset) {
                const {responseData} = await gatewayApi.bi._importDataset({
                    headers,
                    args: {
                        data,
                        id_mapping,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send(responseData);
            } else if (data.dash) {
                const {dash, notifications} = await Dash.prepareImport(data);

                const {responseData} = await gatewayApi.us._createEntry({
                    headers,
                    args: {
                        workbookId: data.workbook_id,
                        ...(dash as any),
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send({
                    id: responseData.entryId,
                    notifications,
                });
            } else if (data.widget) {
                res.status(200).send({});
            } else {
                res.status(400).send({
                    code: ErrorCode.TransferInvalidEntryScope,
                });
            }
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error.status).send(error);
        }
    },
};
