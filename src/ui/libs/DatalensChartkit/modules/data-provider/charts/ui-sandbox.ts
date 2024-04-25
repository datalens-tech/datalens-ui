import type {QuickJSContext, QuickJSHandle, QuickJSWASMModule} from 'quickjs-emscripten';

import {WRAPPED_FN_KEY} from '../../../../../../shared/constants/ui-sandbox';
import {ChartKitCustomError} from '../../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';

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

const getHandle = (vm: QuickJSContext, target: TargetValue, handles: QuickJSHandle[]) => {
    switch (typeof target) {
        case 'bigint': {
            const handle = vm.newBigInt(target);
            handles.push(handle);

            return handle;
        }
        case 'boolean': {
            const handle = target ? vm.true : vm.false;
            handles.push(handle);

            return handle;
        }
        case 'number': {
            const handle = vm.newNumber(target);
            handles.push(handle);

            return handle;
        }
        case 'object': {
            if (target === null) {
                const nullHandle = vm.null;
                handles.push(nullHandle);

                return nullHandle;
            }

            if (Array.isArray(target)) {
                const arrayHandle = vm.newArray();
                handles.push(arrayHandle);
                target.forEach((item, i) => {
                    const itemHandle = getHandle(vm, item, handles);
                    handles.push(itemHandle);
                    vm.setProp(arrayHandle, i, itemHandle);
                });

                return arrayHandle;
            }

            const objectHandle = vm.newObject();
            handles.push(objectHandle);
            Object.entries(target).forEach(([key, value]) => {
                const keyHandle = getHandle(vm, key, handles);
                const valueHandle = getHandle(vm, value, handles);
                vm.setProp(objectHandle, keyHandle, valueHandle);
            });

            return objectHandle;
        }
        case 'string': {
            const handle = vm.newString(target);
            handles.push(handle);

            return handle;
        }
        case 'symbol': {
            const handle = vm.newSymbolFor(target);
            handles.push(handle);

            return handle;
        }
        case 'function':
        case 'undefined':
        default: {
            const handle = vm.undefined;
            handles.push(handle);

            return handle;
        }
    }
};

const defineVmGlobalVariable = (vm: QuickJSContext, target: TargetValue, key: string) => {
    const handles: QuickJSHandle[] = [];
    vm.setProp(vm.global, key, getHandle(vm, target, handles));
    handles.forEach((handle) => handle.alive && handle.dispose());
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

const getUnwrappedFunction = (sandbox: QuickJSWASMModule, fn: string) => {
    return function (...args: unknown[]) {
        const vm = sandbox.newContext();
        defineVmGlobalVariable(vm, args, 'args');
        defineVmGlobalAPI(vm);
        const result = vm.evalCode(`(${fn})(...args)`);
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
            const fn = String(value[WRAPPED_FN_KEY]);
            // Do argument mutation on purpose
            // eslint-disable-next-line no-param-reassign
            target[key] = getUnwrappedFunction(sandbox, fn);
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
