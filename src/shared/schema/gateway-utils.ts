import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}
