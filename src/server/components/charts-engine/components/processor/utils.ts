import isObject from 'lodash/isObject';
import isString from 'lodash/isString';

import {UISandboxContext} from '../../../../../shared/constants/ui-sandbox';
import type {UISandboxWrappedFunction} from '../../../../../shared/types/ui-sandbox';

type ValidatedWrapFnArgs = {
    fn: (...args: unknown[]) => void;
    ctx: UISandboxWrappedFunction['ctx'];
};

// There is a user value here, it could have any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isWrapFnArgsValid = (value: any): value is ValidatedWrapFnArgs => {
    if (!value || typeof value !== 'object') {
        throw new Error('You should pass an object to ChartEditor.wrapFn method');
    }

    const {fn, ctx} = value;

    if (typeof fn !== 'function') {
        throw new Error('"fn" property should be a function');
    }

    const availableCtxValues = Object.values(UISandboxContext);

    if (!Object.values(UISandboxContext).includes(ctx)) {
        throw new Error(`"ctx" property should be a string from list: ${availableCtxValues}`);
    }

    return true;
};

export function getMessageFromUnknownError(e: unknown) {
    return isObject(e) && 'message' in e && isString(e.message) ? e.message : '';
}
