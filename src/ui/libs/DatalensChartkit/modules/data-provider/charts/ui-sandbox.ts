import type {PointOptionsType} from 'highcharts';
import escape from 'lodash/escape';
import get from 'lodash/get';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import type {InterruptHandler, QuickJSWASMModule} from 'quickjs-emscripten';

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
import {validateUrl} from '../../html-generator/utils';

import {UiSandboxRuntime} from './ui-sandbox-runtime';

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

function getChartProps(chart: unknown) {
    return pick(chart, 'chartHeight', 'chartWidth', 'index');
}

function clearVmProp(prop: unknown) {
    if (prop && typeof prop === 'object') {
        if ('angular' in prop) {
            // It looks like it's Highcharts.Chart - preparing a minimum of attributes for the entity
            return getChartProps(prop);
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

async function getUiSandboxLibs(libs: string[]) {
    const modules = await Promise.all(
        libs.map(async (lib) => {
            switch (lib) {
                case 'date-utils@2.3.0': {
                    // eslint-disable-next-line import/no-extraneous-dependencies
                    const module = await import(
                        // @ts-ignore
                        '@datalens-tech/ui-sandbox-modules/dist/@gravity-ui/date-utils/v2.3.0.js?raw'
                    );
                    return module.default;
                }
                case 'date-utils':
                case 'date-utils@2.5.3': {
                    // eslint-disable-next-line import/no-extraneous-dependencies
                    const module = await import(
                        // @ts-ignore
                        '@datalens-tech/ui-sandbox-modules/dist/@gravity-ui/date-utils/v2.5.3.js?raw'
                    );
                    return module.default;
                }
                default: {
                    throw new ChartKitCustomError(null, {
                        details: `The library '${lib}' is not available`,
                    });
                }
            }
        }),
    );

    return modules.filter(Boolean).join('');
}

async function getUnwrappedFunction(args: {
    sandbox: QuickJSWASMModule;
    wrappedFn: UISandboxWrappedFunction;
    options?: UiSandboxRuntimeOptions;
    entryId: string;
    entryType: string;
}) {
    const {sandbox, wrappedFn, options, entryId, entryType} = args;
    const libs = await getUiSandboxLibs(wrappedFn.libs ?? []);
    return function (this: unknown, ...restArgs: unknown[]) {
        if (typeof options?.totalTimeLimit === 'number' && options?.totalTimeLimit <= 0) {
            throw new ChartKitCustomError('The allowed execution time has been exceeded', {
                code: ERROR_CODE.UI_SANDBOX_EXECUTION_TIMEOUT,
            });
        }

        const runId = getRandomCKId();
        Performance.mark(runId);

        // prepare function arguments - merge native with additional from wrapFn
        let preparedUserArgs: unknown[] = [];
        if (wrappedFn.args) {
            preparedUserArgs = Array.isArray(wrappedFn.args) ? wrappedFn.args : [wrappedFn.args];
        }
        const fnArgs = [...restArgs, ...preparedUserArgs].map((a) => clearVmProp(a));

        // prepare function context
        const fnContext = clearVmProp(this);

        // set global api
        const globalApi = {
            console: {
                // Pretty legal usage of console.log due to it invocation explicitly by user
                // eslint-disable-next-line no-console
                log: (...logArgs: unknown[]) => console.log(...logArgs),
            },
            setTimeout: (handler: TimerHandler, timeout: number) => setTimeout(handler, timeout),
            window: {
                open: function (url: string, target?: string) {
                    try {
                        validateUrl(url);
                        window.open(url, target === '_self' ? '_self' : '_blank');
                    } catch (e) {
                        console.error(e);
                    }
                },
            },
            ChartEditor: {
                generateHtml: (value: ChartKitHtmlItem) => wrapHtml(value),
            },
        };

        // extend API for Highcharts charts
        if (entryType === 'graph_node') {
            const getCurrentChart = () => {
                const chart = window.Highcharts.charts?.find(
                    (c: unknown) => get(c, 'userOptions._config.entryId') === entryId,
                );

                if (!chart) {
                    throw Error("Couldn't find a chart associated with this function");
                }
                return chart;
            };

            merge(globalApi, {
                Highcharts: {
                    numberFormat: window.Highcharts.numberFormat,
                    dateFormat: window.Highcharts.dateFormat,
                },
                Chart: {
                    getBoundingClientRect: () => {
                        return getCurrentChart()?.container.getBoundingClientRect();
                    },
                    appendElements: (node: unknown) => {
                        const chart = getCurrentChart();

                        const html = unwrapHtml(wrapHtml(node as ChartKitHtmlItem)) as string;
                        const container = chart.container;
                        const wrapper = document.createElement('div');
                        wrapper.insertAdjacentHTML('beforeend', html);
                        const nodes = Array.from(wrapper.childNodes);

                        return nodes.map((node) => {
                            const el = container.appendChild(node) as HTMLElement;
                            return el.getBoundingClientRect();
                        });
                    },
                    updateSeries: (seriesIndex: number, data: any) => {
                        processHtmlFields(data);
                        getCurrentChart()?.series?.[seriesIndex]?.update(data);
                    },
                    updateTitle: (data: any) => {
                        processHtmlFields(data);
                        getCurrentChart()?.title?.update(data);
                    },
                    updatePoints: (updates: PointOptionsType, match?: Record<string, unknown>) => {
                        const seriesOptions: [string, unknown][] = [];
                        const pointOptions: [string, unknown][] = [];
                        Object.entries(match ?? {}).forEach(([key, value]) => {
                            if (key.startsWith('series.')) {
                                seriesOptions.push([key.replace('series.', ''), value]);
                            } else {
                                pointOptions.push([key, value]);
                            }
                        });

                        let shouldRedraw = false;
                        const chart = getCurrentChart();
                        const chartSeries = chart.series;
                        chartSeries.forEach((s) => {
                            if (seriesOptions.every(([key, value]) => get(s, key) === value)) {
                                s.points?.forEach((p) => {
                                    if (
                                        pointOptions.every(([key, value]) => get(p, key) === value)
                                    ) {
                                        p.update(updates, false);
                                        shouldRedraw = true;
                                    }
                                });
                            }
                        });

                        if (shouldRedraw) {
                            chart.redraw();
                        }
                    },
                    findPoint: (fn: (point: unknown) => boolean) => {
                        const chartSeries = getCurrentChart()?.series ?? [];
                        for (let i = 0; i < chartSeries.length; i++) {
                            const points = chartSeries[i].data;
                            for (let pointIndex = 0; pointIndex < points.length; pointIndex++) {
                                const cleanPoint = clearVmProp(points[pointIndex]);
                                if (fn(cleanPoint)) {
                                    return cleanPoint;
                                }
                            }
                        }
                        return null;
                    },
                },
            });
        }

        const execTimeout = Math.min(UI_SANDBOX_FN_TIME_LIMIT, options?.totalTimeLimit ?? Infinity);
        const interruptHandler = getInterruptAfterDeadlineHandler(Date.now() + execTimeout);
        const runtime = new UiSandboxRuntime({sandbox, interruptHandler});
        const result = runtime.callFunction({
            fn: wrappedFn.fn,
            fnContext,
            fnArgs,
            globalApi,
            libs,
        });

        const performance = Performance.getDuration(runId);
        if (options?.totalTimeLimit) {
            options.totalTimeLimit = Math.max(0, options.totalTimeLimit - Number(performance));
        }

        return unwrapHtml(result);
    };
}

export async function unwrapPossibleFunctions(args: {
    entryId: string;
    entryType: string;
    sandbox: QuickJSWASMModule;
    target: TargetValue;
    options?: UiSandboxRuntimeOptions;
}) {
    const {sandbox, target, options, entryId, entryType} = args;
    if (!target || typeof target !== 'object') {
        return;
    }

    await Promise.all(
        Object.keys(target).map(async (key) => {
            const value = target[key];

            if (value && typeof value === 'object' && WRAPPED_FN_KEY in value) {
                const wrappedFn = value[WRAPPED_FN_KEY] as UISandboxWrappedFunction;
                // TODO: it will become unnecessary after removal Feature.NoJsonFn
                wrappedFn.fn = String(wrappedFn.fn);
                // Do argument mutation on purpose
                // eslint-disable-next-line no-param-reassign
                target[key] = await getUnwrappedFunction({
                    sandbox,
                    wrappedFn,
                    options,
                    entryId,
                    entryType,
                });
            } else if (Array.isArray(value)) {
                await Promise.all(
                    value.map((item) =>
                        unwrapPossibleFunctions({
                            entryId,
                            sandbox,
                            options,
                            target: item,
                            entryType,
                        }),
                    ),
                );
            } else if (value && typeof value === 'object') {
                await unwrapPossibleFunctions({
                    entryId,
                    sandbox,
                    options,
                    target: value,
                    entryType,
                });
            }
        }),
    );
}

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
