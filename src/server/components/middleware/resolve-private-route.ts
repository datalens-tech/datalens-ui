import type {Request, Response} from '@gravity-ui/expresskit';

import {US_MASTER_TOKEN_HEADER} from '../../../../../shared/constants/header';

export const resolvePrivateRoute = (req: Request, res: Response, next: () => void) => {
    const requestMasterToken = req.headers[US_MASTER_TOKEN_HEADER] as string;

    const usMasterToken = req.ctx.config.usMasterToken as string;

    if (!usMasterToken || usMasterToken.length === 0) {
        res.status(403).send({error: 'No master token in config'});
        return;
    }

    if (!requestMasterToken || usMasterToken !== requestMasterToken) {
        req.ctx.log('PRIVATE_API_CALL_DENIED');

        res.status(403).send({error: 'Private API call denied'});
        return;
    }

    next();
};
