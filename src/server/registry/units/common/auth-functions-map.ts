import type {Request, Response} from '@gravity-ui/expresskit';
import type {GetAuthHeadersParams} from '@gravity-ui/gateway';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

export const authFunctionsMap = {
    getAuthArgsUSPrivate:
        makeFunctionTemplate<(req: Request, res: Response) => Record<string, string>>(),
    getAuthHeadersUSPrivate:
        makeFunctionTemplate<
            (
                params: GetAuthHeadersParams<Record<string, unknown>>,
            ) => Record<string, string> | undefined
        >(),
} as const;
