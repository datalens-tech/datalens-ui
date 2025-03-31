import type {Request, Response} from '@gravity-ui/expresskit';

import type {DashData} from '../../shared';
import {EntryScope, ErrorContentTypes} from '../../shared';
import {Utils} from '../components';
import {Dash} from '../components/sdk';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

export const workbooksExportController = {
    export: async (req: Request, res: Response) => {
        try {
            const {ctx} = req;
            const {exportId} = req.body;

            const headers = {
                ...Utils.pickHeaders(req),
            };

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const {responseData: entry} = await gatewayApi.us._getEntry({
                headers,
                args: {
                    entryId: exportId,
                    branch: 'published',
                    includeLinks: true,
                },
                ctx,
                requestId: req.id,
            });

            const workbookId = (entry.data?.workbookId as string) ?? null;
            const id_mapping = req.body.id_mapping;
            const scope = entry.scope;

            switch (entry.scope) {
                case EntryScope.Dash: {
                    const result = await Dash.export(entry.data as unknown as DashData, id_mapping);
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
                    res.status(404).send({
                        code: ErrorContentTypes.NOT_FOUND,
                        extra: {message: `Failed to fined scope: ${scope}`, hideRetry: true},
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
            const responseData = {id: req.id};

            res.status(200).send(responseData);
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error.status).send(error);
        }
    },
};
