import {Request, Response} from '@gravity-ui/expresskit';
import {registry} from '../registry';
import {DatalensGatewaySchemas} from '../types/gateway';
import {RPC_AUTHORIZATION} from '../../shared';

export async function ping(req: Request, res: Response) {
    var r: any = req;
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

    if(r.query['encodeId']) {
        const result = await gatewayApi.us.encodeId({
            ctx: req.ctx,
            headers: {
                ...req.headers,
                [RPC_AUTHORIZATION]: r.query[RPC_AUTHORIZATION]
            },
            requestId: req.id,
            args: {id: r.query['encodeId']},
        });

        res.status(200).send(result.responseData);
    } else if(r.query['decodeId']) {
        const result = await gatewayApi.us.decodeId({
            ctx: req.ctx,
            headers: {
                ...req.headers,
                [RPC_AUTHORIZATION]: r.query[RPC_AUTHORIZATION]
            },
            requestId: req.id,
            args: {id: r.query['decodeId']},
        });

        res.status(200).send(result.responseData.toString());
    } else {
        res.status(200).send('pong');
    }
}
