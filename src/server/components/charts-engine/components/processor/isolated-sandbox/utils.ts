import type {Moment} from 'moment';

export const safeStringify = (value: unknown) => {
    function replaceFunctions(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(replaceFunctions);
        }
        if (typeof value === 'object' && value !== null) {
            if (('_isAMomentObject' in value && value._isAMomentObject) || value instanceof Date) {
                return (value as unknown as Moment).toJSON();
            }

            const replaced: Record<string, unknown> = {};
            Object.keys(value).forEach((key) => {
                replaced[key] = replaceFunctions((value as Record<string, unknown>)[key]);
            });
            return replaced;
        }
        if (typeof value === 'function') {
            return value.toString();
        }
        return value;
    }
    return replaceFunctions(value);
};
