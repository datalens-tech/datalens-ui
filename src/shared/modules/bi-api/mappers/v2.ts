import groupBy from 'lodash/groupBy';

import type {
    ApiV2Filter,
    ApiV2Parameter,
    ApiV2RequestField,
    DatasetField,
    Field,
    FieldRoleSpec,
    FilterField,
} from '../../../types';
import {isDateField} from '../../../types';
import {resolveIntervalDate, resolveRelativeDate} from '../../charts-shared';
import {prepareFilterValues} from '../../helpers';

export const mapFieldToApiV2FieldsFormat = (
    field: Field | DatasetField | {guid: string},
    role: FieldRoleSpec,
): ApiV2RequestField[] => {
    if (role === 'range') {
        return [
            {
                ref: {
                    type: 'id',
                    id: field.guid,
                },
                role_spec: {
                    role,
                    range_type: 'min',
                },
            },
            {
                ref: {
                    type: 'id',
                    id: field.guid,
                },
                role_spec: {
                    role,
                    range_type: 'max',
                },
            },
        ];
    }

    return [
        {
            ref: {
                type: 'id',
                id: field.guid,
            },
            role_spec: {
                role,
            },
        },
    ];
};

export const mapFilterToApiV2FiltersFormat = (filter: FilterField): ApiV2Filter => {
    const column = filter.guid;
    const value = filter.filter.value;
    const values = Array.isArray(value) ? value : [value];
    const operation = filter.filter.operation.code;

    // Check legacy datetime value because of old configs
    if (isDateField(filter)) {
        return {
            values: ([] as string[]).concat(...prepareFilterValues({values})),
            operation,
            ref: {type: 'id', id: column},
        };
    }

    return {
        values,
        operation,
        ref: {type: 'id', id: column},
    };
};

export const mapParameterToApiV2ParametersFormat = (
    parameter: Field | DatasetField,
): ApiV2Parameter => {
    let defaultValue = parameter.default_value;
    if (typeof defaultValue === 'string') {
        if (/^__relative/.test(defaultValue)) {
            defaultValue = resolveRelativeDate(defaultValue)!;
        } else if (/^__interval/.test(defaultValue)) {
            const parsedInterval = resolveIntervalDate(defaultValue)!;

            defaultValue = `__interval_${parsedInterval.from}_${parsedInterval.to}`;
        }
    }

    return {
        ref: {
            type: 'id',
            id: parameter.guid,
        },
        value: defaultValue!,
    };
};

export const getFieldsApiV2RequestSection = (
    fields: (Field | DatasetField | {guid: string})[],
    role: FieldRoleSpec,
): ApiV2RequestField[] => {
    return fields.reduce(
        (apiV2RequestFields, field) => [
            ...apiV2RequestFields,
            ...mapFieldToApiV2FieldsFormat(field, role),
        ],
        [] as ApiV2RequestField[],
    );
};

export const getFiltersApiV2RequestSection = (filters: FilterField[]): ApiV2Filter[] => {
    const filtersWithoutDashboardFilters = filters.filter((item) => !item.disabled);
    return filtersWithoutDashboardFilters.reduce(
        (apiV2Filters, filter) => [...apiV2Filters, mapFilterToApiV2FiltersFormat(filter)],
        [] as ApiV2Filter[],
    );
};

export const getParametersApiV2RequestSection = ({
    parameters,
    dashboardParameters = [],
}: {
    parameters: (Field | DatasetField)[];
    dashboardParameters: (Field | DatasetField)[];
}) => {
    const groupedDashParams = groupBy(dashboardParameters, (p) => p.guid);
    const dashParams = Object.values(groupedDashParams).map((items) => {
        if (items.length > 1) {
            return {
                ...items[0],
                default_value: items.map((item) => item.default_value).join(','),
            };
        }

        return items[0];
    });

    const dashboardParametersGuids = dashParams.reduce(
        (acc, parameter) => ({...acc, [parameter.guid]: true}),
        {} as Record<string, boolean>,
    );
    const filteredParameters = parameters.filter(
        (parameter) => !dashboardParametersGuids[parameter.guid],
    );

    const requestParameters = [...filteredParameters, ...dashParams];

    return requestParameters.reduce((apiV2Parametes, parameter) => {
        return [...apiV2Parametes, mapParameterToApiV2ParametersFormat(parameter)];
    }, [] as ApiV2Parameter[]);
};
