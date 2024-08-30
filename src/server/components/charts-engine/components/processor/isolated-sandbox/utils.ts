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

        if (value instanceof Function || typeof value == 'function') {
            if (isConsole) {
                return;
            }
            if (jsonFn) {
                // JSONfn compatibility mode
                // https://github.com/vkiryukhin/jsonfn/blob/299b4beb4818f7ca98f5e01f0d2a6675b8b2e4ac/jsonfn.js#L38
                const fnBody = value.toString();
                //this is ES6 Arrow Function
                if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') {
                    return '_NuFrRa_' + fnBody;
                }
                return fnBody;
            }
            return undefined;
        }

        return value;
    }
    return replaceNonTransferable(value);
};
