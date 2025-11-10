import type {AppContext} from '@gravity-ui/nodekit';

import type {FilterValue, IntervalPart, TenantSettings} from '../../../../shared';
import {
    EntryScope,
    PALETTE_ID,
    URL_ACTION_PARAMS_PREFIX,
    resolveIntervalDate as sharedResolveIntervalDate,
    resolveOperation as sharedResolveOperation,
    resolveRelativeDate as sharedResolveRelativeDate,
} from '../../../../shared';

import type {DashEntryData, EmbeddingInfo} from './storage/types';

const SENSITIVE_PARAMS_NAMES = ['password', 'pass', 'token'];
const HIDDEN_SENSITIVE_VALUE = '<hidden>';

function getValue(originalValue: [FilterValue] | FilterValue): string | null {
    const value = Array.isArray(originalValue) ? originalValue[0] : originalValue;

    if (typeof value !== 'string') {
        return null;
    }

    return value;
}

export function resolveRelativeDate(
    originalValue: [FilterValue] | FilterValue,
    intervalPart?: IntervalPart,
) {
    const value = getValue(originalValue);
    return (value && sharedResolveRelativeDate(value, intervalPart)) || null;
}

export function resolveIntervalDate(originalValue: [FilterValue] | FilterValue) {
    const value = getValue(originalValue);
    return (value && sharedResolveIntervalDate(value)) || null;
}

export function resolveOperation(originalValue: [FilterValue] | FilterValue) {
    const value = getValue(originalValue);
    return sharedResolveOperation(value);
}

/*
 * @deprecated mutation is bad practice, use resolveNormalizedParams.
 */

// Done in order to change the values that come to params before transferring them to other tabs.
// Converts the entered date parameters. If the date is not valid, then it is forwarded as is.
// Apparently made only for __relative. Because according to the tests, just __interval_from_to is returned as is
export function resolveParams(params: Record<string, string[]>) {
    Object.keys(params).forEach((param) => {
        const paramValues = params[param];
        paramValues.forEach((value, i) => {
            if (typeof value === 'string') {
                if (value.indexOf('__relative') === 0) {
                    const resolvedRelative = resolveRelativeDate(value);

                    if (resolvedRelative) {
                        // BI-1308
                        paramValues[i] = resolvedRelative;
                    }
                } else if (value.indexOf('__interval') === 0) {
                    const resolvedInterval = resolveIntervalDate(value);

                    if (resolvedInterval) {
                        // BI-1308
                        const from = resolvedInterval.from;
                        const to = resolvedInterval.to;

                        paramValues[i] = `__interval_${from}_${to}`;
                    }
                }
            }
        });
    });
}

// Done in order to change the values that come to params before transferring them to other tabs.
// Converts the entered date parameters. If the date is not valid, then it is forwarded as is.
// Apparently made only for __relative. Because according to the tests, just __interval_from_to is returned as is
export function resolveNormalizedParams(params: Record<string, string[]> = {}) {
    return Object.entries(params).reduce(
        (result: Record<string, string[]>, [key, wrappedValue]) => {
            result[key] = wrappedValue.map((value) => {
                const resolvedRelative = resolveRelativeDate(value);

                if (resolvedRelative) {
                    // BI-1308
                    return resolvedRelative;
                }

                const resolvedInterval = resolveIntervalDate(value);

                if (resolvedInterval) {
                    // BI-1308
                    const from = resolvedInterval.from;
                    const to = resolvedInterval.to;

                    return `__interval_${from}_${to}`;
                }

                return value;
            });

            return result;
        },
        {},
    );
}

export function normalizeParams(params: Record<string, string | string[]> = {}) {
    const actionParams: Record<string, string | string[]> = {};
    const preparedParams = Object.entries(params).reduce(
        (result: Record<string, string[]>, [key, value]) => {
            const normalizedVal = Array.isArray(value) ? value : [value];
            if (key.startsWith(URL_ACTION_PARAMS_PREFIX)) {
                actionParams[key.slice(URL_ACTION_PARAMS_PREFIX.length)] = normalizedVal;
            } else {
                result[key] = normalizedVal;
            }
            return result;
        },
        {},
    );

    return {params: preparedParams, actionParams};
}

export function getDuration(hrStart: [number, number]) {
    const hrDuration = process.hrtime(hrStart);
    return (hrDuration[0] * 1e9 + hrDuration[1]) / 1e6;
}

type Test = string | Record<string, string | Record<string, unknown>> | null | '';

export function hideSensitiveData<T extends Test>(data: T = '' as T): T {
    if (typeof data === 'string') {
        return data;
    }
    if (typeof data === 'object' && data !== null) {
        const result = {...data};

        SENSITIVE_PARAMS_NAMES.forEach((name) => {
            if (result[name]) {
                result[name] = HIDDEN_SENSITIVE_VALUE;
            }
        });
        return result;
    }
    return data;
}

export function getSourceAuthorizationHeaders() {
    return {};
}

export const isDashEntry = (entry: EmbeddingInfo['entry']): entry is DashEntryData => {
    if (entry.scope === EntryScope.Dash) {
        return true;
    } else {
        return false;
    }
};

export function getDefaultColorPaletteId({
    ctx,
    tenantSettings,
}: {
    ctx: AppContext;
    tenantSettings?: TenantSettings;
    palettes?: Record<string, unknown>;
}) {
    const tenantDefaultPalette = tenantSettings?.defaultColorPaletteId;
    if (tenantDefaultPalette) {
        return tenantDefaultPalette;
    }

    return ctx.config.defaultColorPaletteId ?? PALETTE_ID.CLASSIC_20;
}
