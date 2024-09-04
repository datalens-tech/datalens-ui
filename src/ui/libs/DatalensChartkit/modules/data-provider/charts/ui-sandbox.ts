import escape from 'lodash/escape';
import pick from 'lodash/pick';
import type {InterruptHandler, QuickJSContext, QuickJSWASMModule} from 'quickjs-emscripten';

import type {ChartKitHtmlItem} from '../../../../../../shared';
import {WRAPPED_FN_KEY, WRAPPED_HTML_KEY} from '../../../../../../shared';
import type {UISandboxWrappedFunction} from '../../../../../../shared/types/ui-sandbox';
import {wrapHtml} from '../../../../../../shared/utils/ui-sandbox';
import {getRandomCKId} from '../../../ChartKit/helpers/getRandomCKId';
import {
    ChartKitCustomError,
    ERROR_CODE,
} from '../../../ChartKit/modules/chartkit-custom-error/chartkit-custom-error';
import Performance from '../../../ChartKit/modules/perfomance';
import type {UiSandboxRuntimeOptions} from '../../../types';
import {generateHtml} from '../../html-generator';

export const UI_SANDBOX_TOTAL_TIME_LIMIT = 3000;
export const UI_SANDBOX_FN_TIME_LIMIT = 100;

/**
 * Config value to check. It could have any type.
 *
 * Each method in this module that uses such a value performs a typing check in runtime.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TargetValue = any;

let uiSandbox: QuickJSWASMModule | undefined;
let getInterruptAfterDeadlineHandler: (deadline: Date | number) => InterruptHandler;

export const getUISandbox = async () => {
    try {
        const {getQuickJS, shouldInterruptAfterDeadline} = await import(
            /* webpackChunkName: "ui-sandbox" */ 'quickjs-emscripten'
        );
        if (!uiSandbox) {
            uiSandbox = await getQuickJS();
            getInterruptAfterDeadlineHandler = shouldInterruptAfterDeadline;
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
    const numberFormatHandle = vm.newFunction('numberFormat', (...args) => {
        const nativeArgs = args.map(vm.dump);
        // @ts-ignore
        const formattedDate = Highcharts.numberFormat(...nativeArgs);
        return vm.newString(formattedDate);
    });
    vm.setProp(vm.global, 'Highcharts', highchartsHandle);
    vm.setProp(highchartsHandle, 'dateFormat', dateFormatHandle);
    vm.setProp(highchartsHandle, 'numberFormat', numberFormatHandle);
    highchartsHandle.dispose();
    dateFormatHandle.dispose();
    numberFormatHandle.dispose();

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

const HC_FORBIDDEN_ATTRS = [
    'chart',
    'this',
    'renderer',
    'container',
    'label',
    'axis',
    'legendItem',
    'legendGroup',
    'legendLine',
    'xAxis',
    'yAxis',
] as const;
const ALLOWED_SERIES_ATTRS = ['color', 'name', 'userOptions', 'state'];

const MAX_NESTING_LEVEL = 5;
function removeSVGElements(val: unknown, nestingLevel = 0): unknown {
    if (nestingLevel > MAX_NESTING_LEVEL) {
        return undefined;
    }

    if (val && typeof val === 'object') {
        if (Array.isArray(val)) {
            if (val.some((item) => item instanceof window.Highcharts.SVGElement)) {
                return [];
            }

            return val.map((item) => removeSVGElements(item, nestingLevel + 1));
        } else {
            return Object.entries(val as object).reduce(
                (acc, [key, value]) => {
                    if (!(value instanceof window.Highcharts.SVGElement)) {
                        acc[key] = removeSVGElements(value, nestingLevel + 1);
                    }

                    return acc;
                },
                {} as Record<string, unknown>,
            );
        }
    }

    return val;
}

function clearVmProp(prop: unknown) {
    if (prop && typeof prop === 'object') {
        if ('angular' in prop) {
            // Remove huge unexpected argument from HC
            return undefined;
        }

        const item: Record<string, TargetValue> = {...(prop as object)};
        HC_FORBIDDEN_ATTRS.forEach((attr) => {
            if (attr in item) {
                if (attr === 'this' && Array.isArray(item[attr]?.points)) {
                    item[attr].points = item[attr].points.map(clearVmProp);
                    return;
                }

                delete item[attr];
            }
        });

        // eslint-disable-next-line prefer-const
        let {series, point, points, this: _this, ...other} = item;
        if (typeof series !== 'undefined') {
            series = pick(series, ...ALLOWED_SERIES_ATTRS);
            delete series.userOptions.data;
        }

        if (typeof point !== 'undefined') {
            const pointClone = clearVmProp(item.point);
            point = removeSVGElements(pointClone);
        }

        if (Array.isArray(points)) {
            points = points.map(clearVmProp);
        }

        return {series, point, points, this: _this, ...(removeSVGElements(other) as object)};
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

const getUnwrappedFunction = (
    sandbox: QuickJSWASMModule,
    wrappedFn: UISandboxWrappedFunction,
    options?: UiSandboxRuntimeOptions,
) => {
    return function (this: unknown, ...args: unknown[]) {
        if (typeof options?.totalTimeLimit === 'number' && options?.totalTimeLimit <= 0) {
            throw new ChartKitCustomError('The allowed execution time has been exceeded', {
                code: ERROR_CODE.UI_SANDBOX_EXECUTION_TIMEOUT,
            });
        }

        const runId = getRandomCKId();
        Performance.mark(runId);
        const runtime = sandbox.newRuntime();

        const execTimeout = Math.min(UI_SANDBOX_FN_TIME_LIMIT, options?.totalTimeLimit ?? Infinity);
        runtime.setInterruptHandler(getInterruptAfterDeadlineHandler(Date.now() + execTimeout));

        const vm = runtime.newContext();
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
        runtime.dispose();

        const resultValue = unwrapHtml(value);
        const performance = Performance.getDuration(runId);
        if (options?.totalTimeLimit) {
            options.totalTimeLimit = Math.max(0, options.totalTimeLimit - Number(performance));
        }

        return resultValue;
    };
};

export const unwrapPossibleFunctions = (
    sandbox: QuickJSWASMModule,
    target: TargetValue,
    options?: UiSandboxRuntimeOptions,
) => {
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
            target[key] = getUnwrappedFunction(sandbox, wrappedFn, options);
        } else if (Array.isArray(value)) {
            value.forEach((item) => unwrapPossibleFunctions(sandbox, item, options));
        } else if (value && typeof value === 'object') {
            unwrapPossibleFunctions(sandbox, value, options);
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

export function processHtmlFields(target: unknown, options?: {allowHtml: boolean}) {
    const allowHtml = Boolean(options?.allowHtml);

    if (target && typeof target === 'object') {
        if (Array.isArray(target)) {
            target.forEach((item, index) => {
                if (item && typeof item === 'object') {
                    if (WRAPPED_HTML_KEY in item) {
                        target[index] = generateHtml(item[WRAPPED_HTML_KEY] as ChartKitHtmlItem);
                    } else {
                        processHtmlFields(item, options);
                    }
                } else if (typeof item === 'string' && !allowHtml) {
                    target[index] = escape(item);
                }
            });
        } else {
            const config = target as Record<string, unknown>;
            Object.entries(config).forEach(([key, value]) => {
                if (value && typeof value === 'object') {
                    if (WRAPPED_HTML_KEY in value) {
                        config[key] = generateHtml(value[WRAPPED_HTML_KEY] as ChartKitHtmlItem);
                    } else {
                        processHtmlFields(value, options);
                    }
                } else if (typeof value === 'string' && !allowHtml) {
                    config[key] = escape(value);
                }
            });
        }
    }
}

export function unwrapHtml(value: unknown) {
    if (value && typeof value === 'object' && WRAPPED_HTML_KEY in value) {
        return generateHtml(value[WRAPPED_HTML_KEY] as ChartKitHtmlItem);
    }

    if (typeof value === 'string') {
        return escape(value);
    }

    return value;
}
