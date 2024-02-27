import type {ConnectionTypedQueryApiResponse} from 'shared';

export const validateTypedQueryResponseForSelector = (
    response: ConnectionTypedQueryApiResponse,
) => {
    const data = response.data;

    return data.headers.length === 1;
};
