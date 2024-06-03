import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {
    DASH_INFO_HEADER,
    DL_CONTEXT_HEADER,
    REQUEST_ID_HEADER,
    TENANT_ID_HEADER,
} from '../../shared';

type DlContext = Record<string, string | string[] | undefined>;

export default function xDlContext() {
    return function xDlContextMiddleware(req: Request, _: Response, next: NextFunction) {
        const {folderId: folderIdHeader} = req.ctx.config.headersMap;

        const folderId = req.headers[folderIdHeader];
        const tenantId = req.headers[TENANT_ID_HEADER];

        const context: DlContext = {
            remoteAddress: req.headers['x-real-ip'],
            userAgent: req.headers['user-agent'],
            folderId: folderId || tenantId,
            tenantId,
            requestId: req.headers[REQUEST_ID_HEADER],
            referer: req.ctx.utils.redactSensitiveQueryParams(req.headers['referer']),
        };

        if (req.headers[DASH_INFO_HEADER]) {
            const parsedDashInfo = new URLSearchParams(
                (req.headers[DASH_INFO_HEADER] || '').toString(),
            );

            const dashId = parsedDashInfo.get('dashId');
            const dashTabId = parsedDashInfo.get('dashTabId');

            if (dashId) {
                context.dashId = dashId;
            }
            if (dashTabId) {
                context.dashTabId = dashTabId;
            }
        }

        req.headers[DL_CONTEXT_HEADER] = JSON.stringify(context);
        req.originalContext.set(
            'tenantId',
            tenantId && Array.isArray(tenantId) ? tenantId.join(',') : tenantId,
        );

        next();
    };
}
