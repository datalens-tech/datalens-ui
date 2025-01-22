import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import type {DurationUnit} from '@gravity-ui/date-utils';

import type {ServerDatasetField} from '../types';

import {isParameter} from './helpers';

export type Scale = 'y' | 'Q' | 'M' | 'w' | 'd' | 'h' | 'm' | 's' | 'ms';

export const CLIP_SCALES: Scale[] = ['d', 'w', 'M', 'Q', 'y'];

export const ScaleToDurationUnit: Record<Scale, DurationUnit> = {
    y: 'year',
    Q: 'quarter',
    M: 'month',
    w: 'week',
    d: 'day',
    h: 'hour',
    m: 'minute',
    s: 'second',
    ms: 'millisecond',
};

export type Sign = '+' | '-';

export type CastType = 's' | 'e';

export type IntervalPart = 'start' | 'end';

export type FilterValue = string | null | undefined;

export enum Operations {
    IN = 'IN',
    NIN = 'NIN',
    EQ = 'EQ',
    NE = 'NE',
    GT = 'GT',
    LT = 'LT',
    GTE = 'GTE',
    LTE = 'LTE',
    ISNULL = 'ISNULL',
    ISNOTNULL = 'ISNOTNULL',
    ISTARTSWITH = 'ISTARTSWITH',
    STARTSWITH = 'STARTSWITH',
    IENDSWITH = 'IENDSWITH',
    ENDSWITH = 'ENDSWITH',
    ICONTAINS = 'ICONTAINS',
    CONTAINS = 'CONTAINS',
    NOTICONTAINS = 'NOTICONTAINS',
    NOTCONTAINS = 'NOTCONTAINS',
    BETWEEN = 'BETWEEN',
    LENEQ = 'LENEQ',
    LENGT = 'LENGT',
    LENGTE = 'LENGTE',
    LENLT = 'LENLT',
    LENLTE = 'LENLTE',
    NO_SELECTED_VALUES = 'NO_SELECTED_VALUES',
}

export enum OperationsWithoutValue {
    ISNULL = Operations.ISNULL,
    ISNOTNULL = Operations.ISNOTNULL,
}

type ParsedDlRelativeDate = [Sign, string, Scale, CastType, Scale];

export const IS_NULL_FILTER_TEMPLATE = `__${Operations.ISNULL}_`;

export const DEFAULT_OPERATION_TITLE: Record<Operations, string> = {
    ...Operations,
    [Operations.EQ]: '=',
    [Operations.NE]: '≠',
    [Operations.GT]: '>',
    [Operations.LT]: '<',
    [Operations.GTE]: '≥',
    [Operations.LTE]: '≤',
};

export const getDefaultTitleForOperation = (operation: Operations) =>
    DEFAULT_OPERATION_TITLE[operation];

const IntervalRegExp = {
    DL: /^__interval_(__relative_\W\d+\w(?:_\w\w)?|[^_]+)_(.+)$/,
    DATE_UTILS: /^__interval_(now(?:_now)?|[^_]+)_(.+)$/,
};

export type FiltersOperationFromURL = {
    operation: Operations;
    value: string;
};

export function getParsedRelativeDate(value: FilterValue) {
    if (!value) {
        return null;
    }

    const match = value.match(
        /^__relative_([+-])(\d+)(y|Q|M|w|d|h|m|s|ms)(?:_([se])([yQMwdhms]))?$/,
    );

    if (!match) {
        return null;
    }

    const [, sign, amount, scale, cast, castScale] = match;

    return [sign, amount, scale, cast, castScale] as ParsedDlRelativeDate;
}

function resolveDlRelative(value: FilterValue, intervalPart: IntervalPart = 'start') {
    const parsedDate = getParsedRelativeDate(value);

    if (!parsedDate) {
        return null;
    }

    const [sign, amount, scale, cast, castScale] = parsedDate;

    const durationUnit = ScaleToDurationUnit[scale];
    let date = dateTime({timeZone: 'UTC'}).add(`${sign}${amount}`, durationUnit);

    if (cast) {
        const castUnit = ScaleToDurationUnit[castScale];
        date = cast === 's' ? date.startOf(castUnit) : date.endOf(castUnit);
    } else if (CLIP_SCALES.indexOf(scale) !== -1) {
        date = intervalPart === 'start' ? date.startOf('day') : date.endOf('day');
    }

    return date.toISOString();
}

function isDateUtilsRelative(value: FilterValue) {
    return typeof value === 'string' && value.startsWith('now');
}

function resolveDateUtilsRelative(value: FilterValue, intervalPart?: IntervalPart) {
    if (!isDateUtilsRelative(value)) {
        return null;
    }

    const date = dateTimeParse(value as string, {
        timeZone: 'UTC',
        roundUp: intervalPart === 'end',
    });

    return date?.toISOString() || null;
}

// processes the relative format and generates an ISO date
// for scales from a day or more, depending on intervalPart, the time is set to the beginning/end of the day:
// * IntervalPart.Start - YYYY-MM-DDT00:00:00.000Z
// * IntervalPart.End - YYYY-MM-DDT23:59:59.999Z
export function resolveRelativeDate(value: FilterValue, intervalPart?: IntervalPart) {
    const parsedDl = resolveDlRelative(value, intervalPart);
    const parsedDateUtils = resolveDateUtilsRelative(value, intervalPart);

    return parsedDl || parsedDateUtils;
}

export function getParsedIntervalDates(value: FilterValue) {
    if (!value) {
        return null;
    }

    const match = value.match(IntervalRegExp.DL) || value.match(IntervalRegExp.DATE_UTILS);

    if (!match) {
        return null;
    }

    const [, matchedFrom, matchedTo] = match;

    return [matchedFrom, matchedTo];
}

// processes interval format and generates two ISO dates: {from, to}
// if from or to is an incorrect date, return null
export function resolveIntervalDate(value: FilterValue) {
    const parsedData = getParsedIntervalDates(value);

    if (!parsedData) {
        return null;
    }

    const [parsedFrom, parsedTo] = parsedData;
    const from =
        resolveRelativeDate(parsedFrom, 'start') ||
        (dateTime({input: parsedFrom}).isValid() && parsedFrom) ||
        null;
    const to =
        resolveRelativeDate(parsedTo, 'end') ||
        (dateTime({input: parsedTo}).isValid() && parsedTo) ||
        null;

    if (from && to) {
        return {from, to};
    }

    return null;
}

export function resolveOperation(
    urlValue: FilterValue,
    defaultOperation?: Operations,
): FiltersOperationFromURL | null {
    if (!urlValue) {
        return null;
    }

    // In an ideal world, urlValue should always be string. However, in ChartEditor, the user can put in params
    // absolutely anything. Therefore, if it is not a string, then we make a fallback to the old behavior.
    if (typeof urlValue !== 'string') {
        return getFallbackForUrlFilters(urlValue, defaultOperation);
    }

    const match = urlValue.match(/^_{2}([^_]+)_([\s\S]+)?$/);

    if (!match) {
        return getFallbackForUrlFilters(urlValue, defaultOperation);
    }

    const operation = match[1]?.toUpperCase();
    const value = match[2];

    if (
        typeof value === 'undefined' &&
        !Object.values(OperationsWithoutValue).includes(
            operation as unknown as OperationsWithoutValue,
        )
    ) {
        return getFallbackForUrlFilters(urlValue);
    }

    if (Object.values(Operations).includes(operation as unknown as Operations)) {
        return {
            operation: operation as Operations,
            value,
        };
    }

    return getFallbackForUrlFilters(urlValue);
}

function getFallbackForUrlFilters(
    urlValue: any,
    defaultOperation?: Operations,
): FiltersOperationFromURL {
    let operation = defaultOperation ?? Operations.IN;

    if (typeof urlValue === 'string' && urlValue.indexOf('__interval') > -1) {
        operation = Operations.BETWEEN;
    }

    return {
        operation,
        value: urlValue,
    };
}

export function splitParamsToParametersAndFilters(
    urlSearchParams: [string, string][],
    fields: ServerDatasetField[],
) {
    const parametersMap = fields.filter(isParameter).reduce(
        (acc, field) => {
            acc[field.guid] = true;
            acc[field.title] = true;
            return acc;
        },
        {} as Record<string, true>,
    );

    return urlSearchParams.reduce(
        (acc, curr) => {
            const paramGuid = curr[0] || '';

            if (parametersMap[paramGuid]) {
                const parameterValue = curr[1];
                const resolvedParameterValue = resolveOperation(parameterValue);

                acc.parametersParams.push([
                    paramGuid,
                    resolvedParameterValue?.value || parameterValue,
                ]);
            } else {
                acc.filtersParams.push(curr);
            }
            return acc;
        },
        {
            filtersParams: [],
            parametersParams: [],
        } as {
            filtersParams: [string, string][];
            parametersParams: [string, string][];
        },
    );
}

export type ChartsInsight = {
    locator: ChartsInsightLocator;
    title: string;
    message: string;
    level: string;
};

export enum ChartsInsightLocator {
    UsingDeprecatedDatetimeFields = 'using_deprecated_datetime_fields',
}

export function isObjectWith(
    value: unknown,
    check: (value: unknown) => boolean,
    ignore?: string[],
    path = '',
): string | false {
    if (!value) {
        return false;
    }

    if (check(value)) {
        return path;
    }

    if (Array.isArray(value)) {
        for (let index = 0; index < value.length; index++) {
            const pathToItem = isObjectWith(value[index], check, ignore, `${path}[${index}]`);
            if (pathToItem) {
                return pathToItem;
            }
        }
    }

    if (typeof value === 'object') {
        const entries = Object.entries(value as object);
        for (let index = 0; index < entries.length; index++) {
            const [key, val] = entries[index];
            if (ignore?.includes(key)) {
                continue;
            }

            const pathToItem = isObjectWith(val, check, ignore, path ? `${path}.${key}` : key);
            if (pathToItem) {
                return pathToItem;
            }
        }
    }

    return false;
}
