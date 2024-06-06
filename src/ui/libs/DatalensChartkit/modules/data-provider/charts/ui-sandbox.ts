import escape from 'lodash/escape';
import pick from 'lodash/pick';
import type {QuickJSContext, QuickJSWASMModule} from 'quickjs-emscripten';

import {WRAPPED_HTML_KEY} from '../../../../../../shared';
import {WRAPPED_FN_KEY} from '../../../../../../shared/constants/ui-sandbox';
import type {UISandboxWrappedFunction} from '../../../../../../shared/types/ui-sandbox';
import {wrapHtml} from '../../../../../../shared/utils/ui-sandbox';
import {ChartKitCustomError} from '../../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import {generateHtml} from '../../html-generator';

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

    const highchartsHandle = vm.newObject();
    const dateFormatHandle = vm.newFunction('dateFormat', (...args) => {
        const nativeArgs = args.map(vm.dump);
        // @ts-ignore
        const formattedDate = Highcharts.dateFormat(...nativeArgs);
        return vm.newString(formattedDate);
    });
    vm.setProp(vm.global, 'Highcharts', highchartsHandle);
    vm.setProp(highchartsHandle, 'dateFormat', dateFormatHandle);
    highchartsHandle.dispose();
    dateFormatHandle.dispose();

    const chartEditorHandle = vm.newObject();
    const generateHtmlHandle = vm.newFunction('generateHtml', (...args) => {
        const nativeArgs = args.map(vm.dump);
        // @ts-ignore
        const wrappedHtmlConfig = wrapHtml(...nativeArgs);
        return vm.evalCode(`JSON.parse('${JSON.stringify(wrappedHtmlConfig)}')`);
    });
    vm.setProp(vm.global, 'ChartEditor', chartEditorHandle);
    vm.setProp(chartEditorHandle, 'generateHtml', generateHtmlHandle);
    chartEditorHandle.dispose();
    generateHtmlHandle.dispose();
};

const HC_FORBIDDEN_ATTRS = ['chart', 'this', 'renderer', 'container', 'label'];
const ALLOWED_SERIES_ATTRS = ['color', 'name', 'userOptions', 'xData'];

function clearVmProp(prop: unknown) {
    if (prop && typeof prop === 'object') {
        if ('angular' in prop) {
            // Remove huge unexpected argument from HC
            return undefined;
        }

        const item: Record<string, unknown> = {...(prop as object)};
        HC_FORBIDDEN_ATTRS.forEach((attr) => {
            if (attr in item) {
                delete item[attr];
            }
        });

        if ('series' in item) {
            item.series = pick(item.series, ...ALLOWED_SERIES_ATTRS);
        }

        if ('point' in item) {
            item.point = clearVmProp(item.point);
        }

        if ('points' in item && Array.isArray(item.points)) {
            const points = item.points as unknown[];
            item.points = points.map(clearVmProp);
        }

        return item;
    }

    if (prop && typeof prop === 'function') {
        return prop.toString();
    }

    return prop;
}

const defineVmArguments = (vm: QuickJSContext, args: unknown[], userArgs?: unknown) => {
    let preparedUserArgs: unknown[] = [];

    if (userArgs) {
        preparedUserArgs = Array.isArray(userArgs) ? userArgs : [userArgs];
    }

    const preparedArgs = [...args, ...preparedUserArgs].map((a) => clearVmProp(a));

    let stringifiedArgs = '[]';
    try {
        stringifiedArgs = JSON.stringify(preparedArgs);
    } catch (e) {
        console.error(e, {args: preparedArgs});
    }

    const vmArgs = vm.newString(stringifiedArgs);
    vm.setProp(vm.global, 'args', vmArgs);
    vmArgs.dispose();
};

const defineVmContext = (vm: QuickJSContext, context: unknown) => {
    let stringifiedContext = '';
    const preparedContext = clearVmProp(context);
    try {
        stringifiedContext = JSON.stringify(preparedContext);
    } catch (e) {
        console.error(e, {context: preparedContext});
    }

    const vmFunctionContext = vm.newString(stringifiedContext);
    vm.setProp(vm.global, 'context', vmFunctionContext);
    vmFunctionContext.dispose();
};

const getUnwrappedFunction = (sandbox: QuickJSWASMModule, wrappedFn: UISandboxWrappedFunction) => {
    return function (this: unknown, ...args: unknown[]) {
        const vm = sandbox.newContext();
        defineVmArguments(vm, args, wrappedFn.args);
        defineVmContext(vm, this);
        defineVmGlobalAPI(vm);
        const result = vm.evalCode(
            `(${wrappedFn.fn}).call(JSON.parse(context), ...(args.length
                ? JSON.parse(args).map((arg) => {
                    if(typeof arg === "string" && arg.startsWith('function')) {
                        let fn;
                        eval('fn = ' + arg);
                        return fn;
                    }
                    return arg;
                })
                : []))`,
        );
        let value: unknown | undefined;

        if (result.error) {
            console.error('Execution failed:', vm.dump(result.error));
            result.error.dispose();
        } else {
            value = vm.dump(result.value);
            result.value.dispose();
        }

        vm.dispose();

        return unwrapHtml(value);
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
        if (!obj || typeof obj !== 'object') {
            return;
        }
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ItemValue = any;

export function generateSafeHtml(target: ItemValue) {
    if (!target || typeof target !== 'object') {
        return;
    }

    Object.keys(target).forEach((key) => {
        const value = target[key];

        if (value && typeof value === 'object' && WRAPPED_HTML_KEY in value) {
            // eslint-disable-next-line no-param-reassign
            target[key] = generateHtml(value[WRAPPED_HTML_KEY]);
        } else if (Array.isArray(value)) {
            value.forEach(generateSafeHtml);
        } else if (value && typeof value === 'object') {
            generateSafeHtml(value);
        }
    });
}

export function unwrapHtml(value: ItemValue) {
    if (value && typeof value === 'object' && WRAPPED_HTML_KEY in value) {
        return generateHtml(value[WRAPPED_HTML_KEY]);
    }

    if (typeof value === 'string') {
        return escape(value);
    }

    return value;
}
