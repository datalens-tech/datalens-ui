import type {GetAuthHeadersParams} from '@gravity-ui/gateway';

import {makeFunctionTemplate} from '../../../../shared/utils/makeFunctionTemplate';

export const authFunctionsMap = {
    getAuthHeadersUSPrivate:
        makeFunctionTemplate<
            (
                params: GetAuthHeadersParams<Record<string, unknown>>,
            ) => Record<string, string> | undefined
        >(),
} as const;
