import type {Request, Response} from '@gravity-ui/expresskit';

import {getLandingLayout} from '../components';

import {getError} from './page-error';

export async function onFail(req: Request, res: Response) {
    res.status(500).send(await getLandingLayout(req, res, getError(req).onFail));
}

export async function onMissingEntry(req: Request, res: Response) {
    res.status(404).send(await getLandingLayout(req, res, getError(req).onMissingEntry));
}

export function defaultOnFail(_: Request, res: Response) {
    res.status(500).send({message: 'Internal server error'});
}
