import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

type ValidatedWrapFnArgs = {
    fn: (...args: unknown[]) => unknown;
    args?: unknown;
};

// There is a user value here, it could have any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isWrapFnArgsValid = (value: any): value is ValidatedWrapFnArgs => {
    if (!value || typeof value !== 'object') {
        throw new Error('You should pass an object to ChartEditor.wrapFn method');
    }

    if (typeof value.fn !== 'function') {
        throw new Error('"fn" property should be a function');
    }

    return true;
};

export function getMessageFromUnknownError(e: unknown) {
    return isObject(e) && 'message' in e && isString(e.message) ? e.message : '';
}

const ESCAPE_CHART_FIELDS_DATE = new Date('2030-01-01').valueOf();
export function isChartWithJSAndHtmlAllowed(config: {createdAt: string}) {
    if (!config.createdAt) {
        return true;
    }

    return new Date(config.createdAt).valueOf() < ESCAPE_CHART_FIELDS_DATE;
}
