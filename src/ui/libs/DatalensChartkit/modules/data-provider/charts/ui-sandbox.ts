import type {QuickJSContext, QuickJSWASMModule} from 'quickjs-emscripten';

import {WRAPPED_FN_KEY} from '../../../../../../shared/constants/ui-sandbox';
import type {UISandboxWrappedFunction} from '../../../../../../shared/types/ui-sandbox';
import {ChartKitCustomError} from '../../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

// https://github.com/douglascrockford/JSON-js/blob/master/cycle.js
function decycle(object: unknown) {
    const objects = new WeakMap(); // object to path mappings

    return (function derez(value, path, level) {
        // The derez function recurses through the object, producing the deep copy.

        let old_path; // The path of an earlier occurance of value
        let nu; // The new object or array

        // typeof null === "object", so go on if this value is really an object but not
        // one of the weird builtin objects.

        if (
            typeof value === 'object' &&
            value !== null &&
            !(value instanceof Boolean) &&
            !(value instanceof Date) &&
            !(value instanceof Number) &&
            !(value instanceof RegExp) &&
            !(value instanceof String)
        ) {
            // If the value is an object or array, look to see if we have already
            // encountered it. If so, return a {"$ref":PATH} object. This uses an
            // ES6 WeakMap.

            old_path = objects.get(value);
            if (old_path !== undefined) {
                return {$ref: old_path};
            }

            if (level > 10) {
                return null;
            }

            // Otherwise, accumulate the unique value and its path.

            objects.set(value, path);

            // If it is an array, replicate the array.

            if (Array.isArray(value)) {
                nu = [];
                value.forEach(function (element, i) {
                    nu[i] = derez(element, path + '[' + i + ']', level + 1);
                });
            } else {
                // If it is an object, replicate the object.

                nu = {};
                Object.keys(value).forEach(function (name) {
                    nu[name] = derez(
                        value[name],
                        path + '[' + JSON.stringify(name) + ']',
                        level + 1,
                    );
                });
            }
            return nu;
        }
        return value;
    })(object, '$', 0);
}

/**
 * Config value to check. It could have any type.
 *
 * Each method in this module that uses such a value performs a typing check in runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TargetValue = any;

let uiSandbox: QuickJSWASMModule | undefined;

export const getUISandbox = async () => {
    try {
        const {getQuickJS} = await import(
            /* webpackChunkName: "ui-sandbox" */ 'quickjs-emscripten'
        );
        if (!uiSandbox) {
            uiSandbox = await getQuickJS();
        }
    } catch {
        throw new ChartKitCustomError(null, {details: 'Failed to load QuickJSWASMModule'});
    }

    return uiSandbox;
};

const defineVmGlobalAPI = (vm: QuickJSContext) => {
    const logHandle = vm.newFunction('log', (...logArgs) => {
        const nativeArgs = logArgs.map(vm.dump);
        // Pretty legal usage of console.log due to it invocation explicitly by user
        // eslint-disable-next-line no-console
        console.log(...nativeArgs);
    });
    const consoleHandle = vm.newObject();
    vm.setProp(vm.global, 'console', consoleHandle);
    vm.setProp(consoleHandle, 'log', logHandle);
    consoleHandle.dispose();
    logHandle.dispose();
};

const defineVmArguments = (
    vm: QuickJSContext,
    ctx: UISandboxWrappedFunction['ctx'],
    args: unknown[],
) => {
    const stringifiedArgs = JSON.stringify(args.map((item) => decycle(item)));
    const vmArgs = vm.newString(stringifiedArgs);
    vm.setProp(vm.global, 'args', vmArgs);
    vmArgs.dispose();
};

const getUnwrappedFunction = (sandbox: QuickJSWASMModule, wrappedFn: UISandboxWrappedFunction) => {
    return function (...args: unknown[]) {
        const vm = sandbox.newContext();
        defineVmArguments(vm, wrappedFn.ctx, args);
        defineVmGlobalAPI(vm);
        const result = vm.evalCode(`(${wrappedFn.fn})(...(args.length ? JSON.parse(args) : []))`);
        let value: unknown | undefined;

        if (result.error) {
            console.error('Execution failed:', vm.dump(result.error));
            result.error.dispose();
        } else {
            value = vm.dump(result.value);
            result.value.dispose();
        }

        vm.dispose();

        return value;
    };
};

export const unwrapPossibleFunctions = (sandbox: QuickJSWASMModule, target: TargetValue) => {
    if (!target || typeof target !== 'object') {
        return;
    }

    Object.keys(target).forEach((key) => {
        const value = target[key];

        if (value && typeof value === 'object' && WRAPPED_FN_KEY in value) {
            const wrappedFn = value[WRAPPED_FN_KEY] as UISandboxWrappedFunction;
            // TODO: it will become unnecessary after removal Feature.NoJsonFn
            wrappedFn.fn = String(wrappedFn.fn);
            // Do argument mutation on purpose
            // eslint-disable-next-line no-param-reassign
            target[key] = getUnwrappedFunction(sandbox, wrappedFn);
        } else if (Array.isArray(value)) {
            value.forEach((item) => unwrapPossibleFunctions(sandbox, item));
        } else if (value && typeof value === 'object') {
            unwrapPossibleFunctions(sandbox, value);
        }
    });
};

export const shouldUseUISandbox = (target: TargetValue) => {
    if (!target || typeof target !== 'object') {
        return false;
    }

    let result = false;
    const checkObjectKey = (obj: TargetValue) => {
        Object.keys(obj).forEach((key) => {
            if (key === WRAPPED_FN_KEY) {
                result = true;
                return;
            }

            if (Array.isArray(obj[key])) {
                obj[key].forEach((item: TargetValue) => checkObjectKey(item));
                return;
            }

            if (obj[key] && typeof obj[key] === 'object') {
                checkObjectKey(obj[key]);
            }
        });
    };

    if (Array.isArray(target)) {
        target.forEach((item: TargetValue) => checkObjectKey(item));
    } else {
        checkObjectKey(target);
    }

    return result;
};
