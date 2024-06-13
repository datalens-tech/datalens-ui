import type {WizardVisualizationId} from '../constants';
import {
    ENTRY_ID_LENGTH,
    ENTRY_ROUTES,
    ENTRY_SLUG_SEPARATOR,
    NavigatorModes,
    VISUALIZATIONS_WITH_NAVIGATOR,
    WIZARD_ROUTE,
} from '../constants';
import type {
    Field,
    ServerChartsConfig,
    ServerField,
    ServerPlaceholder,
    ServerPlaceholderSettings,
    StringParams,
} from '../types';
import {AxisMode, DATASET_FIELD_TYPES, DatasetFieldType, isDateField} from '../types';

import {
    Operations,
    resolveIntervalDate,
    resolveOperation,
    resolveRelativeDate,
} from './charts-shared';

function getEntryId(str: string): string | null {
    const possibleEntryId = str.slice(0, ENTRY_ID_LENGTH);
    const isEntryIdResult = isEntryId(possibleEntryId);
    if (isEntryIdResult && str.length === ENTRY_ID_LENGTH) {
        return possibleEntryId;
    }
    if (isEntryIdResult && str[ENTRY_ID_LENGTH] === ENTRY_SLUG_SEPARATOR) {
        return possibleEntryId;
    }
    return null;
}

export function extractEntryId(input?: string): string | null {
    if (!input || typeof input !== 'string') {
        return null;
    }

    const [partOne, partTwo, partThree] = input.split('/').filter(Boolean);
    if (partThree === WIZARD_ROUTE && partTwo === 'new') {
        return getEntryId(partOne);
    }
    if (partTwo && ENTRY_ROUTES.some((route) => partOne === route)) {
        return getEntryId(partTwo);
    }
    if (partOne && partTwo !== 'new') {
        return getEntryId(partOne);
    }
    return null;
}

export function decodeURISafe(uri: string) {
    if (!uri) {
        return uri;
    }
    return decodeURI(uri.replace(/%(?![0-9a-fA-F][0-9a-fA-F]+)/g, '%25'));
}

type PrepareFilterValuesArgs = {
    field?: ServerField;
    values: string[];
};

type PreparedFilterValues = {
    values: (string | string[])[];
    operations: Operations[];
};

export function prepareFilterValuesWithOperations({values, field}: PrepareFilterValuesArgs) {
    return prepareArrayFilterValues({values, field});
}

export function prepareFilterValues({values}: {values: string[]}): (string[] | string)[] {
    return prepareArrayFilterValues({values}).values;
}

function prepareArrayFilterValues({
    field,
    values,
}: {
    field?: ServerField;
    values: string[];
}): PreparedFilterValues {
    return values.reduce(
        (
            acc: {
                operations: Operations[];
                values: (string[] | string)[];
            },
            rawValue: string,
        ) => {
            const defaultOperation =
                field && isDateField(field) && values.length === 1 ? Operations.EQ : undefined;
            const parsedFiltersOperation = resolveOperation(rawValue, defaultOperation);

            if (!parsedFiltersOperation) {
                acc.values.push(rawValue);
                acc.operations.push(Operations.IN);
                return acc;
            }

            let value: string[] | string | null = parsedFiltersOperation.value;
            let operation = parsedFiltersOperation.operation;

            if (/^__relative/.test(value)) {
                value = resolveRelativeDate(value);
            } else if (/^__interval/.test(value)) {
                const interval = resolveIntervalDate(value);

                if (!(interval === null || interval.from === null || interval.to === null)) {
                    value = [interval.from, interval.to];
                    operation = Operations.BETWEEN;
                }
            }

            if (value !== null) {
                acc.values.push(value);
                acc.operations.push(operation);
            }

            return acc;
        },
        {operations: [], values: []},
    );
}

export function getAxisMode(
    placeholderSettings?: ServerPlaceholderSettings,
    fieldGuid?: string,
): AxisMode {
    const xAxisModeMap = placeholderSettings?.axisModeMap || {};

    let xAxisMode;

    if (fieldGuid) {
        xAxisMode = xAxisModeMap[fieldGuid];
    }

    return xAxisMode || AxisMode.Discrete;
}

export function getIsNavigatorAvailable(
    visualization:
        | {
              id: string;
              placeholders: ServerPlaceholder[];
          }
        | undefined,
) {
    if (!visualization) {
        return false;
    }

    const {placeholders, id} = visualization;
    const xPlaceholder = Array.isArray(placeholders) && placeholders.find((pl) => pl.id === 'x');

    if (!xPlaceholder) {
        return false;
    }

    const xItems = xPlaceholder.items;

    return Boolean(
        VISUALIZATIONS_WITH_NAVIGATOR.has(id as WizardVisualizationId) &&
            xItems.length &&
            isDateField(xItems[0]) &&
            getAxisMode(xPlaceholder.settings, xItems[0].guid) !== AxisMode.Discrete,
    );
}

export function getIsNavigatorEnabled(shared: ServerChartsConfig) {
    const extraSettings = shared.extraSettings;
    const navigatorMode =
        extraSettings?.navigatorSettings?.navigatorMode || extraSettings?.navigatorMode;
    return getIsNavigatorAvailable(shared.visualization) && navigatorMode === NavigatorModes.Show;
}

export const isParameter = (field: Partial<Field> | Partial<ServerField>) => {
    return field.calc_mode === 'parameter';
};

export const isDimensionField = (field: Partial<Field> | Partial<ServerField> | undefined) => {
    return field?.type === DatasetFieldType.Dimension && !isParameter(field);
};

export const isMeasureField = (field: Partial<Field> | Partial<ServerField> | undefined) => {
    return field?.type === DatasetFieldType.Measure;
};

export const isPseudoField = (field: Partial<Field> | Partial<ServerField> | undefined) => {
    return field?.type === DatasetFieldType.Pseudo;
};

export const isTreeDataType = (data_type: string) => {
    return (
        data_type === DATASET_FIELD_TYPES.TREE_STR ||
        data_type === DATASET_FIELD_TYPES.TREE_INT ||
        data_type === DATASET_FIELD_TYPES.TREE_FLOAT
    );
};

export const isTreeField = (field: {data_type: string}) => {
    return isTreeDataType(field.data_type);
};

export const transformParamsToUrlParams = (widgetParams: StringParams) => {
    return Object.keys(widgetParams).reduce((acc: [string, string][], paramName: string) => {
        const paramValue = widgetParams[paramName];
        if (Array.isArray(paramValue)) {
            return acc.concat(paramValue.map((value) => [paramName, value]));
        } else {
            acc.push([paramName, paramValue]);
            return acc;
        }
    }, []);
};

export const prepareUrlParams = (params: [string, string][]): [string, string][] => {
    return params.map((param: [string, string]) => {
        // Ideally, the parameters should always contain strings.
        // But sometimes number|boolean|string can be specified.
        return param.map(String) as [string, string];
    });
};
export const transformUrlParamsToParams = (urlParams: [string, string][]) => {
    return prepareUrlParams(urlParams).reduce((acc, paramsPair) => {
        const [key, value = ''] = paramsPair;
        if (acc[key]) {
            (acc[key] as string[]).push(value);
        } else {
            acc[key] = [value];
        }
        return acc;
    }, {} as StringParams);
};

export function getSortedData<K extends string, T>(data: Record<K, T>): Record<K, T> {
    return Object.keys(data)
        .sort()
        .reduce(
            (acc, key) => {
                acc[key as K] = data[key as K];
                return acc;
            },
            {} as Record<K, T>,
        );
}

export function getObjectValueByPossibleKeys<T>(possibleKeys: string[], obj: Record<string, T>) {
    const firstMatchedKey = possibleKeys.find((key) => typeof obj[key] !== 'undefined');

    if (firstMatchedKey) {
        return obj[firstMatchedKey];
    }

    return undefined;
}

export const isEntryId = (value: string) => {
    const ENTRY_ID_FORMAT = /^[0-9a-z]{13}$/;
    return ENTRY_ID_FORMAT.test(value);
};
