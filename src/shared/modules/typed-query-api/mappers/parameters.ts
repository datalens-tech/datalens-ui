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

export const mapParametersRecordToTypedQueryApiParameters = (
    parameters: Record<string, string | string[]>,
): ConnectionTypedQueryParameter[] => {
    return Object.entries(parameters)
        .filter(([_key, value]) => value.length)
        .map((pair) => {
            const key = pair[0];
            const value = pair[1];

            return mapStringParameterToTypedQueryApiParameter(key, value);
        });
};
