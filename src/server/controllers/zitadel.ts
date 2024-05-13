import {Request, Response} from '@gravity-ui/expresskit';

import {appHostUri, clientId, zitadelUri} from '../app-env';

export async function logout(req: Request, res: Response) {
    if (!clientId) {
        throw new Error('Missing CLIENT_ID in env');
    }
    req.logOut((err) => {
        if (err) {
            throw err;
        }
    });

    const url =
        `${zitadelUri}/oidc/v1/end_session?` +
        new URLSearchParams({
            post_logout_redirect_uri: appHostUri + '/auth',
            client_id: clientId,
        });

    res.redirect(url);
}
