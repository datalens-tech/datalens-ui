import {sanitizeUrl} from '@braintree/sanitize-url';
import type {PointOptionsType} from 'highcharts';
import escape from 'lodash/escape';
import get from 'lodash/get';
import merge from 'lodash/merge';
import pick from 'lodash/pick';
import set from 'lodash/set';
import type {InterruptHandler, QuickJSWASMModule} from 'quickjs-emscripten';
import {chartStorage} from 'ui/libs/DatalensChartkit/ChartKit/plugins/chart-storage';

import type {ChartKitHtmlItem, StringParams} from '../../../../../../shared';
import {
    EditorType,
    LegacyEditorType,
    WRAPPED_FN_KEY,
    WRAPPED_HTML_KEY,
} from '../../../../../../shared';
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
import {getParseHtmlFn} from '../../html-generator/utils';

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

const EVENT_KEYS = ['ctrlKey', 'altKey', 'shiftKey', 'metaKey'];

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

function clearVmProp(prop: unknown): unknown {
    if (prop && typeof prop === 'object') {
        if (Array.isArray(prop)) {
            return prop.map(clearVmProp);
        }

        if ('angular' in prop) {
            // It looks like it's Highcharts.Chart - preparing a minimum of attributes for the entity
            return getChartProps(prop);
        }

        // instanceof Event
        const eventProps = 'preventDefault' in prop ? pick(prop, EVENT_KEYS) : {};

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

        return {
            series,
            point,
            points,
            this: _this,
            ...(removeSVGElements(other) as object),
            ...eventProps,
        };
    }

    if (prop && typeof prop === 'function') {
        return prop.toString();
    }

    return prop;
}

async function getUiSandboxLibs(libs: string[]) {
    const getModule = (name: string) =>
        import(`@datalens-tech/ui-sandbox-modules/dist/${name}.js?raw`).then(
            (module) => module.default,
        );
    const additionalModules = libs.map((lib) => {
        switch (lib) {
            case 'date-utils@2.3.0': {
                return getModule('@gravity-ui/date-utils/v2.3.0');
            }
            case 'date-utils':
            case 'date-utils@2.5.3': {
                return getModule('@gravity-ui/date-utils/v2.5.3');
            }
            case 'd3@7.9.0':
            case 'd3': {
                return getModule('d3/v7.9.0');
            }
            case 'd3-chord@3.0.1':
            case 'd3-chord': {
                return getModule('d3-chord/v3.0.1');
            }
            case 'd3-sankey@0.12.3':
            case 'd3-sankey': {
                return getModule('d3-sankey/v0.12.3');
            }
            default: {
                throw new ChartKitCustomError(null, {
                    details: `The library '${lib}' is not available`,
                });
            }
        }
    });

    const modules = await Promise.all([getModule('dom-api'), ...additionalModules]);
    return modules.filter(Boolean).join('');
}

async function getUnwrappedFunction(args: {
    sandbox: QuickJSWASMModule;
    wrappedFn: UISandboxWrappedFunction;
    options?: UiSandboxRuntimeOptions;
    entryId: string;
    entryType: string;
    name?: string;
}) {
    const {sandbox, wrappedFn, options, entryId, entryType, name} = args;
    const uiSandboxLibs = await getUiSandboxLibs(wrappedFn.libs ?? []);
    const parseHtml = await getParseHtmlFn();
    const isAdvancedChart = (
        [EditorType.AdvancedChartNode, LegacyEditorType.BlankChart] as string[]
    ).includes(entryType);

    return function (this: unknown, ...restArgs: unknown[]) {
        let libs = uiSandboxLibs;
        const runId = getRandomCKId();
        Performance.mark(runId);

        // prepare function arguments - merge native with additional from wrapFn
        let preparedUserArgs: unknown[] = [];
        if (wrappedFn.args) {
            preparedUserArgs = Array.isArray(wrappedFn.args) ? wrappedFn.args : [wrappedFn.args];
        }
        let fnArgs: unknown[] = [...restArgs];
        if (entryType === 'graph_node') {
            fnArgs = fnArgs.map((a) => clearVmProp(a));
        }

        fnArgs = [...fnArgs, ...preparedUserArgs];

        // prepare function context
        let fnContext = this;

        if (entryType === 'graph_node') {
            fnContext = clearVmProp(fnContext);
        }

        // set global api
        const globalApi = {
            console: {
                // Pretty legal usage of console.log due to it invocation explicitly by user
                // eslint-disable-next-line no-console
                log: (...logArgs: unknown[]) => console.log(...logArgs),
            },
            setTimeout: (handler: TimerHandler, timeout: number) => setTimeout(handler, timeout),
            clearTimeout: (timeoutId: number) => clearTimeout(timeoutId),
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

                        const html = unwrapHtml({
                            value: wrapHtml(node as ChartKitHtmlItem),
                        }) as string;
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
                window: {
                    open: function (url: string, target?: string) {
                        try {
                            const href = sanitizeUrl(url);
                            window.open(href, target === '_self' ? '_self' : '_blank');
                        } catch (e) {
                            console.error(e);
                        }
                    },
                },
            });
        } else if (isAdvancedChart) {
            const chartId = get(this, 'chartId');
            const chartContext = chartStorage.get(chartId);

            merge(globalApi, {
                Chart: {
                    getState: () => {
                        return chartContext.getState();
                    },
                    setState: (update: any, options?: any) => {
                        chartContext?.setState(update, options);
                    },
                    updateActionParams: (params: StringParams) => {
                        chartContext?.updateActionParams(params);
                    },
                },
                ChartEditor: {
                    updateActionParams: (params: StringParams) => {
                        chartContext?.updateActionParams(params);
                    },
                    updateParams: (params: StringParams) => {
                        chartContext?.updateParams(params);
                    },
                },
            });

            if (fnContext && typeof fnContext === 'object' && '__innerHTML' in fnContext) {
                libs += `document.body.innerHTML = (${JSON.stringify(fnContext.__innerHTML)});`;
            }
        }

        merge(globalApi, {
            Editor: globalApi.ChartEditor,
        });

        const oneRunTimeLimit = options?.fnExecTimeLimit ?? UI_SANDBOX_FN_TIME_LIMIT;
        const execTimeout = Math.min(oneRunTimeLimit, options?.totalTimeLimit ?? Infinity);
        const runtime = new UiSandboxRuntime({
            sandbox,
            getInterruptAfterDeadlineHandler,
            timelimit: execTimeout,
        });
        try {
            const {result, execTime} = runtime.callFunction({
                fn: wrappedFn.fn,
                fnContext,
                fnArgs,
                globalApi,
                libs,
                name,
            });

            if (options?.totalTimeLimit) {
                options.totalTimeLimit = Math.max(0, options.totalTimeLimit - Number(execTime));
            }

            return unwrapHtml({value: result, parseHtml, addElementId: isAdvancedChart});
        } catch (e) {
            const performance = Performance.getDuration(runId);
            if (performance && e?.message === 'interrupted') {
                if (options?.totalTimeLimit && performance > options?.totalTimeLimit) {
                    throw new ChartKitCustomError('The allowed execution time has been exceeded', {
                        code: ERROR_CODE.UI_SANDBOX_EXECUTION_TIMEOUT,
                    });
                }

                if (performance > oneRunTimeLimit) {
                    const msg = `The "${name}" function takes too long to execute. Try to optimize the code.`;
                    const error = new ChartKitCustomError(msg, {
                        code: ERROR_CODE.UI_SANDBOX_FN_EXECUTION_TIMEOUT,
                        details: {
                            stackTrace: `Execution time: ${performance}ms`,
                        },
                    });
                    error.stack = undefined;

                    throw error;
                }
            }

            throw e;
        }
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
                    name: key,
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

type ProcessHtmlOptions = {
    allowHtml: boolean;
    parseHtml?: (value: string) => unknown;
    ignoreInvalidValues?: boolean;
    addElementId?: boolean;
};

export function processHtmlFields(target: unknown, options?: ProcessHtmlOptions) {
    const allowHtml = Boolean(options?.allowHtml);

    const processValue = (key: string | number, value: unknown, item: object) => {
        if (value && typeof value === 'object') {
            if (WRAPPED_HTML_KEY in value) {
                let content = value[WRAPPED_HTML_KEY];
                if (typeof content === 'string' && typeof options?.parseHtml === 'function') {
                    content = options.parseHtml(content);
                }
                set(
                    item,
                    key,
                    generateHtml(content as ChartKitHtmlItem, {
                        ignoreInvalidValues: options?.ignoreInvalidValues,
                        addElementId: options?.addElementId,
                    }),
                );
            } else {
                processHtmlFields(value, options);
            }
        } else if (typeof value === 'string' && !allowHtml) {
            set(item, key, escape(value));
        }
    };

    if (target && typeof target === 'object') {
        if (Array.isArray(target)) {
            target.forEach((item, index) => {
                processValue(index, item, target);
            });
        } else {
            const config = target as Record<string, unknown>;
            Object.entries(config).forEach(([key, value]) => {
                processValue(key, value, config);
            });
        }
    }
}

function unwrapHtml(args: {
    value: unknown;
    parseHtml?: (value: string) => unknown;
    addElementId?: boolean;
}) {
    const {value, parseHtml, addElementId} = args;
    if (value && typeof value === 'object' && WRAPPED_HTML_KEY in value) {
        let content = value[WRAPPED_HTML_KEY];
        if (typeof content === 'string' && typeof parseHtml === 'function') {
            content = parseHtml(content);
        }
        return generateHtml(content as ChartKitHtmlItem, {addElementId});
    }

    if (typeof value === 'string') {
        return escape(value);
    }

    return value;
}
