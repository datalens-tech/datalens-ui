import type {Request, Response} from '@gravity-ui/expresskit';

import {getAuthLayout} from './auth-layout';

export async function onAuthReload(req: Request, res: Response) {
    res.status(409).send(await getAuthLayout(req, res, {page: 'reload'}));
}

export async function onAuthSignin(req: Request, res: Response) {
    res.status(200).send(await getAuthLayout(req, res, {page: 'signin'}));
}

export async function onAuthLogout(req: Request, res: Response) {
    res.status(401).send(await getAuthLayout(req, res, {page: 'logout'}));
}
