import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {DL_COMPONENT_HEADER, RPC_AUTHORIZATION, DL_CONTEXT_HEADER, TENANT_ID_HEADER} from '../../../../shared';

type SubrequestHeaders = Record<string, unknown>;
type AuthFlags = Record<string, boolean>;

// Middleware for generating authorization headers that will then go to subqueries in ChartsEngine
export function setSubrequestHeaders(req: Request, res: Response, next: NextFunction) {
    const subrequestHeaders: SubrequestHeaders = {};

    // most likely these flags are not needed
    const authFlags: AuthFlags = {};

    if (req.headers.authorization) {
        subrequestHeaders.authorization = req.headers.authorization;

        if (req.headers.authorization.startsWith('OAuth ')) {
            authFlags.oauth = true;
        }
    }

    const {folderId: folderIdHeader, subjectToken: subjectTokenHeader} = req.ctx.config.headersMap;

    const folderId = req.headers[folderIdHeader];
    const tenantId = req.headers[TENANT_ID_HEADER];

    if (folderId) {
        // TODO: in the future, abandon this header when BI supports TenantId
        subrequestHeaders[folderIdHeader] = folderId;
    } else if (tenantId) {
        subrequestHeaders[TENANT_ID_HEADER] = tenantId;
    }

    req.headers[subjectTokenHeader] = res.locals.iam?.token;

    if(req.headers[RPC_AUTHORIZATION]) {
        subrequestHeaders[RPC_AUTHORIZATION] = req.headers[RPC_AUTHORIZATION];
    }
    
    if (req.headers[subjectTokenHeader]) {
        subrequestHeaders[subjectTokenHeader] = req.headers[subjectTokenHeader];
    }

    if (req.headers.cookie) {
        subrequestHeaders.cookie = req.headers.cookie;
    }

    if (res.locals.tvm) {
        authFlags.tvm = true;
    }

    subrequestHeaders[DL_CONTEXT_HEADER] = req.headers[DL_CONTEXT_HEADER];
    subrequestHeaders[DL_COMPONENT_HEADER] = req.headers[DL_COMPONENT_HEADER];

    res.locals.subrequestHeaders = subrequestHeaders;
    res.locals.authFlags = authFlags;

    next();
}
