import type {Moment} from 'moment';

export const safeStringify = (
    value: unknown,
    {jsonFn, isConsole}: {jsonFn?: boolean; isConsole?: boolean} = {},
) => {
    function replaceNonTransferable(value: unknown): unknown {
        if (Array.isArray(value)) {
            return value.map(replaceNonTransferable);
        }

        if (typeof value === 'object' && value !== null) {
            if (('_isAMomentObject' in value && value._isAMomentObject) || value instanceof Date) {
                return (value as unknown as Moment).toJSON();
            }

            const replaced: Record<string, unknown> = {};
            Object.keys(value).forEach((key) => {
                const currentValue = (value as Record<string, unknown>)[key];
                replaced[key] = replaceNonTransferable(currentValue);
                if (isConsole) {
                    if (replaced[key] === undefined && typeof currentValue === 'function') {
                        delete replaced[key];
                    }
                }
            });
            return replaced;
        }

        if (typeof value === 'function') {
            if (isConsole) {
                return;
            }
            return jsonFn ? value.toString() : undefined;
        }
        return value;
    }
    return replaceNonTransferable(value);
};
