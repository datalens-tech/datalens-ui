import type {ResponseError} from '@gravity-ui/gateway';
import type {AxiosRequestConfig, AxiosResponse} from 'axios';
import omit from 'lodash/omit';
import qs from 'qs';

export function filterUrlFragment(input: string) {
    return /^[a-zA-Z0-9._:-]*$/.test(input) ? input : '';
}

export function decodePathParams<TParams extends {}>(params: TParams) {
    const decodedParams: Record<string, string> = {};

    Object.keys(params).forEach((key) => {
        decodedParams[key] = decodeURIComponent(
            params[key as unknown as keyof TParams] as unknown as string,
        );
    });

    return decodedParams;
}

export const defaultParamsSerializer: AxiosRequestConfig['paramsSerializer'] = (queryParams) => {
    return qs.stringify(queryParams, {arrayFormat: 'repeat'});
};

export function omitCloudAuthUnitHeaders(
    headers: Record<string, unknown>,
    cloudIdHeader: string,
    folderIdHeader: string,
    tenantIdHeader: string,
): Record<string, unknown> {
    return omit(headers, cloudIdHeader, folderIdHeader, tenantIdHeader);
}

export const transformResponseError = (response: ResponseError) => {
    const data = (response.data || {}) as AxiosResponse['data'];
    const {code, message} = data;

    return {
        code,
        message,
        status: response.status,
        details: {data: response.data},
    };
};
