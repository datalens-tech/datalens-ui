import type {Request, Response} from '@gravity-ui/expresskit';

export function ping(_: Request, res: Response) {
    res.status(200).send('pong');
}
