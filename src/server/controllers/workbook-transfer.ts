import type {Request, Response} from '@gravity-ui/expresskit';

import type {DashEntry} from '../../shared';
import {EntryScope, EntryUpdateMode, ErrorCode} from '../../shared';
import type {EntryFieldData} from '../../shared/schema';
import {Utils} from '../components';
import {prepareExportData, prepareImportData} from '../components/charts-engine/controllers/charts';
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
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.send(403).send({
                    code: ErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {exportId, id_mapping} = req.body;
            const workbookId = (req.body?.workbookId as string) ?? null;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            const {responseData: entry} = await gatewayApi.us._proxyGetEntry({
                headers,
                args: {
                    entryId: exportId,
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
                        id_mapping,
                    );

                    res.status(200).send(result);
                    break;
                }
                case EntryScope.Widget: {
                    const {key, type} = entry;
                    const nameParts = key.split('/');
                    const name = nameParts[nameParts.length - 1];

                    const data = await prepareExportData(entry, id_mapping);
                    if (data === null) {
                        res.status(400).send({
                            code: ErrorCode.TransferInvalidEntryData,
                        });
                    }

                    res.status(200).send({
                        [EntryScope.Widget]: {
                            data,
                            name,
                            template: data.type,
                            type,
                        },
                        notifications: [],
                    });
                    break;
                }
                case EntryScope.Connection: {
                    const {responseData} = await gatewayApi.bi._proxyExportConnection({
                        headers,
                        args: {
                            connectionId: exportId,
                            id_mapping,
                            workbookId,
                            usMasterToken,
                        },
                        ctx,
                        requestId: req.id,
                    });

                    res.status(200).send(responseData);
                    break;
                }
                case EntryScope.Dataset: {
                    const {responseData} = await gatewayApi.bi._proxyExportDataset({
                        headers,
                        args: {
                            datasetId: exportId,
                            id_mapping,
                            workbookId,
                            usMasterToken,
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
            const usMasterToken = Utils.pickUsMasterToken(req);

            if (!usMasterToken) {
                res.send(403).send({
                    code: ErrorCode.TransferInvalidToken,
                });
                return;
            }

            const {data, id_mapping} = req.body;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

            if (EntryScope.Connection in data) {
                const {responseData} = await gatewayApi.bi._proxyImportConnection({
                    headers,
                    args: {
                        data,
                        id_mapping,
                        usMasterToken,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send(responseData);
            } else if (EntryScope.Dataset in data) {
                const {responseData} = await gatewayApi.bi._proxyImportDataset({
                    headers,
                    args: {
                        data,
                        id_mapping,
                        usMasterToken,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send(responseData);
            } else if (EntryScope.Dash in data) {
                const {dash, notifications} = await Dash.prepareImport(data);

                const {responseData} = await gatewayApi.us._proxyCreateEntry({
                    headers,
                    args: {
                        workbookId: data.workbook_id,
                        ...(dash as any),
                        usMasterToken,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send({
                    id: responseData.entryId,
                    notifications,
                });
            } else if (EntryScope.Widget in data) {
                const chartsData = await prepareImportData(data.widget, req, id_mapping);

                const {responseData} = await gatewayApi.us._proxyCreateEntry({
                    headers: {
                        ...headers,
                        metadata: ctx.getMetadata(),
                    },
                    args: {
                        workbookId: data.workbook_id,
                        key: data.widget.key,
                        name: data.widget.name,
                        data: chartsData.chart as EntryFieldData,
                        type: chartsData.type || '',
                        scope: EntryScope.Widget,
                        links: chartsData.links || {},
                        mode: EntryUpdateMode.Publish,
                        includePermissionsInfo: true,
                        usMasterToken,
                    },
                    ctx,
                    requestId: req.id,
                });

                res.status(200).send({
                    id: responseData.entryId,
                    notifications: [],
                });
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
