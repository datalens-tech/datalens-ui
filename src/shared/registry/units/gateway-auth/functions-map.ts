import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeadersParams} from '@gravity-ui/gateway';

import {makeFunctionTemplate} from '../../../utils/makeFunctionTemplate';

export const gatewayAuthFunctionsMap = {
    getAuthArgsUSPrivate:
        makeFunctionTemplate<(req: Request, res: Response) => Record<string, string>>(),
    getAuthHeadersUSPrivate:
        makeFunctionTemplate<
            (
                params: GetAuthHeadersParams<Record<string, unknown>>,
            ) => Record<string, string> | undefined
        >(),
    getAuthArgsBiPrivate:
        makeFunctionTemplate<(req: Request, res: Response) => Record<string, string>>(),
    getAuthHeadersBiPrivate:
        makeFunctionTemplate<
            (
                params: GetAuthHeadersParams<Record<string, unknown>>,
            ) => Record<string, string> | undefined
        >(),
    hasValidWorkbookTransferAuthHeaders: makeFunctionTemplate<(req: Request) => boolean>(),
    getProxyingAuthArgsUSPrivate:
        makeFunctionTemplate<(req: Request, res: Response) => Record<string, string>>(),
    getProxyingAuthArgsBiPrivate:
        makeFunctionTemplate<(req: Request, res: Response) => Record<string, string>>(),
} as const;
