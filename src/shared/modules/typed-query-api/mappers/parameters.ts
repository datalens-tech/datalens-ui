import type {ConnectionTypedQueryParameter} from '../../../types';

export const mapStringParameterToTypedQueryApiParameter = (
    key: string,
    value: string | string[],
): ConnectionTypedQueryParameter => {
    return {
        name: key,
        data_type: 'string',
        value: Array.isArray(value) ? value[0] : value,
    };
};
