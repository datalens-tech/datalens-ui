import {Request, Response} from '@gravity-ui/expresskit';
import {ApiServiceActionConfig} from '@gravity-ui/gateway';
import {AppContext} from '@gravity-ui/nodekit';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}
