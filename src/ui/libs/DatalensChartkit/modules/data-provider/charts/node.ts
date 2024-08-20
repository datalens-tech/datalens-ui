import type {Chart, Series, SeriesClickEventObject} from 'highcharts';
import Highcharts from 'highcharts';
import {i18n} from 'i18n';
import JSONfn from 'json-fn';
import logger from 'libs/logger';
import {UserSettings} from 'libs/userSettings';
import {omit} from 'lodash';
import get from 'lodash/get';
import partial from 'lodash/partial';
import partialRight from 'lodash/partialRight';
import pick from 'lodash/pick';
import set from 'lodash/set';
import type {Optional} from 'utility-types';

import type {StringParams} from '../../../../../../shared';
import {
    ChartkitHandlers,
    EDITOR_CHART_NODE,
    QL_CHART_NODE,
    SHARED_URL_OPTIONS,
    WIZARD_CHART_NODE,
} from '../../../../../../shared';
import {DL} from '../../../../../constants/common';
import {registry} from '../../../../../registry';
import Utils from '../../../../../utils';
import {getYfmRenderFn as getRenderMarkdownFn} from '../../../../../utils/markdown/get-render-yfm-fn';
import type {
    ControlsOnlyWidget,
    GraphWidget,
    UiSandboxRuntimeOptions,
    Widget,
    WithControls,
} from '../../../types';
import DatalensChartkitCustomError from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import {ChartkitHandlersDict, baseRenderFn} from './chartkit-handlers';
import {getChartsInsightsData} from './helpers';
import type {ChartsData, ResponseSuccessControls, ResponseSuccessNode, UI} from './types';
import {
    UI_SANDBOX_TOTAL_TIME_LIMIT,
    getUISandbox,
    processHtmlFields,
    shouldUseUISandbox,
    unwrapPossibleFunctions,
} from './ui-sandbox';
import {getSafeChartWarnings, isPotentiallyUnsafeChart} from './utils';

import {CHARTS_ERROR_CODE} from '.';

interface ChartKitFormatterOptions {
    prefix?: 'string';
    postfix?: 'string';
    mappingVariables?: Record<
        string,
        {
            mapper: Record<string, string>;
            mappingKey: string;
        }
    >;
    wrapLink?: {
        href: 'string';
        value: 'string';
    };
}

type CurrentResponse = ResponseSuccessNode | ResponseSuccessControls;

function getChartInstanceFromContext(context: Chart | Series) {
    if (context instanceof Highcharts.Chart) {
        return context;
    } else if (context instanceof Highcharts.Series) {
        return context.chart;
    } else {
        return undefined;
    }
}

const handlerActionToCustomHandlerMapper = {
    openLink(
        this: Series | Chart,
        _: SeriesClickEventObject,
        {url, sourceField}: {url?: string; sourceField?: string},
    ) {
        if (url) {
            window.open(url);
        }

        const chart: Chart | undefined = getChartInstanceFromContext(this);

        if (chart && chart.hoverPoint && chart.hoverPoint.options[sourceField || 'url']) {
            window.open(chart.hoverPoint.options[sourceField || 'url']);
        } else if (this.options && this.options[sourceField || 'url']) {
            const url = this.options[sourceField || 'url'] as string;

            window.open(url);
        }
    },
    hideOthers(this: Series, event: SeriesClickEventObject) {
        if (this instanceof Highcharts.Chart) {
            console.warn(
                'Warning: "hideOthers" handler can be attached only on Series, this handler will be ignored',
            );

            return false;
        }

        (this.chart.series || []).forEach((series) => {
            if (series !== this) {
                series.setVisible(false, false);
                this.chart.tooltip.refresh([event.point]);
            }
        });

        (this.chart.hoverPoints || []).forEach((point) => {
            if (point !== this.chart.hoverPoint) {
                point.setState('');
            }
        });

        return false;
    },
    hideThis(this: Series) {
        if (this instanceof Highcharts.Chart) {
            console.warn(
                'Warning: "hideThis" handler can be attached only on Series, this handler will be ignored',
            );

            return false;
        }

        this.chart.tooltip.hide();

        this.setVisible(false, false);

        return false;
    },
    showHidden(this: Chart | Series) {
        const chart = getChartInstanceFromContext(this);

        if (chart) {
            if (chart.hoverPoints) {
                chart.hoverPoints.forEach((point) => {
                    point.setState('');
                });
            }

            (chart.series || []).forEach((series) => {
                if (!series.visible) {
                    series.setVisible(true, true);

                    if (!chart.tooltip.isHidden) {
                        chart.tooltip.hide();
                    }
                }
            });

            (chart.hoverPoints || []).forEach((point) => {
                point.setState('');
            });
        }
    },
    updateParams(
        this: Series | Chart,
        _: SeriesClickEventObject,
        {sourceField}: {sourceField?: string},
    ) {
        const chart: Chart | undefined = getChartInstanceFromContext(this);

        if (chart && chart.hoverPoint && chart.hoverPoint.options[sourceField || 'params']) {
            chart.updateParams(
                chart.hoverPoint.options[sourceField || 'params'] as unknown as StringParams,
            );
        } else if (this instanceof Highcharts.Series && (sourceField || 'params') in this.options) {
            this.chart.updateParams(this.options[sourceField || 'params'] as StringParams);
        }
    },
};

function getVariable(
    context: Record<string, string>,
    mappingVariables: Record<string, string>,
    property: string,
) {
    if (property in mappingVariables) {
        return mappingVariables[property];
    } else {
        return context[property];
    }
}

function formatter(this: Record<string, string>, options: ChartKitFormatterOptions) {
    const prefix = options.prefix || '';
    const postfix = options.postfix || '';
    const mappingVariables: Record<string, string> = {};

    if (options.mappingVariables && Object.keys(options.mappingVariables).length) {
        Object.keys(options.mappingVariables).forEach((mappingVariableName) => {
            if (options.mappingVariables) {
                const {mapper, mappingKey} = options.mappingVariables[mappingVariableName];

                mappingVariables[mappingVariableName] = mapper[this[mappingKey]];
            }
        });
    }

    let result = `${prefix}${this.value}${postfix}`;

    if (options.wrapLink) {
        const href = getVariable(this, mappingVariables, options.wrapLink.href);
        const text = getVariable(this, mappingVariables, options.wrapLink.value);

        result = `<a href="${href}" target="_blank">${prefix}${text}${postfix}</a>`;
    }

    return result;
}

function replacer(_: string, value: any) {
    if (value && value.__chartkitHandler && value.action) {
        const action: keyof typeof handlerActionToCustomHandlerMapper = value.action || '';

        return partialRight(handlerActionToCustomHandlerMapper[action], value);
    }

    if (value && value.__chartkitFormatter) {
        return partial(formatter, value);
    }

    return value;
}

function isNodeResponse(loaded: CurrentResponse): loaded is ResponseSuccessNode {
    return 'data' in loaded;
}

/* eslint-disable complexity */
async function processNode<T extends CurrentResponse, R extends Widget | ControlsOnlyWidget>(
    loaded: T,
    noJsonFn?: boolean,
): Promise<R & ChartsData> {
    const {
        type: loadedType,
        params,
        defaultParams,
        id,
        key,
        usedParams,
        unresolvedParams,
        sources,
        logs_v2,
        timings,
        extra,
        requestId,
        traceId,
    } = loaded;

    try {
        const showSafeChartInfo =
            Utils.getOptionsFromSearch(window.location.search).showSafeChartInfo ||
            (params &&
                SHARED_URL_OPTIONS.SAFE_CHART in params &&
                String(params?.[SHARED_URL_OPTIONS.SAFE_CHART]?.[0]) === '1');

        let result: Widget & Optional<WithControls> & ChartsData = {
            // @ts-ignore
            type: loadedType.match(/^[^_]*/)![0],
            params: omit(params, 'name'),
            defaultParams,
            entryId: id,
            key,
            usedParams,
            sources,
            logs_v2,
            timings,
            extra,
            requestId,
            traceId,
            isNewWizard: loadedType in WIZARD_CHART_NODE,
            isOldWizard: false,
            isEditor: loadedType in EDITOR_CHART_NODE,
            isQL: loadedType in QL_CHART_NODE,
        };

        if ('unresolvedParams' in loaded) {
            result.unresolvedParams = unresolvedParams;
        }

        if ('publicAuthor' in loaded) {
            const publicAuthor = loaded.publicAuthor;
            (result as GraphWidget).publicAuthor = publicAuthor;
        }

        if (isNodeResponse(loaded)) {
            const parsedConfig = JSON.parse(loaded.config);
            const enableJsAndHtml = get(parsedConfig, 'enableJsAndHtml', true);

            const jsonParse = noJsonFn || enableJsAndHtml === false ? JSON.parse : JSONfn.parse;

            result.data = loaded.data;
            result.config = jsonParse(loaded.config);
            result.libraryConfig = jsonParse(
                loaded.highchartsConfig,
                noJsonFn ? replacer : undefined,
            );

            if (showSafeChartInfo) {
                result.safeChartInfo = getSafeChartWarnings(
                    loadedType,
                    pick(result, 'config', 'libraryConfig', 'data'),
                );
            }

            if (
                shouldUseUISandbox(result.config) ||
                shouldUseUISandbox(result.libraryConfig) ||
                shouldUseUISandbox(result.data)
            ) {
                const uiSandbox = await getUISandbox();
                const uiSandboxOptions: UiSandboxRuntimeOptions = {};
                if (!get(loaded.params, SHARED_URL_OPTIONS.WITHOUT_UI_SANDBOX_LIMIT)) {
                    // creating an object for mutation
                    // so that we can calculate the total execution time of the sandbox
                    uiSandboxOptions.totalTimeLimit = UI_SANDBOX_TOTAL_TIME_LIMIT;
                }

                unwrapPossibleFunctions(uiSandbox, result.config, uiSandboxOptions);
                unwrapPossibleFunctions(uiSandbox, result.libraryConfig, uiSandboxOptions);
                unwrapPossibleFunctions(uiSandbox, result.data, uiSandboxOptions);
                result.uiSandboxOptions = uiSandboxOptions;
            }

            processHtmlFields(result.data, {
                allowHtml: !isPotentiallyUnsafeChart(loadedType) || enableJsAndHtml,
            });
            processHtmlFields(result.libraryConfig, {allowHtml: enableJsAndHtml});

            await applyChartkitHandlers({
                config: result.config,
                libraryConfig: result.libraryConfig,
                graphs: get(result.data, 'graphs', []),
            });

            if ('sideMarkdown' in loaded.extra && loaded.extra.sideMarkdown) {
                (result as GraphWidget).sideMarkdown = loaded.extra.sideMarkdown;
            }

            if ('chartsInsights' in loaded.extra && loaded.extra.chartsInsights) {
                const {chartsInsightsLocators = ''} = UserSettings.getInstance().getSettings();

                try {
                    const locators = chartsInsightsLocators
                        ? JSON.parse(chartsInsightsLocators)
                        : {};

                    const chartsInsightsData = getChartsInsightsData(
                        loaded.extra.chartsInsights,
                        locators,
                    );
                    (result as GraphWidget).chartsInsightsData = chartsInsightsData;
                } catch (error) {
                    logger.logError('ChartsInsights: process data failed', error);
                }
            }

            const postProcessRunResult = registry.chart.functions.get('postProcessRunResult');

            if (postProcessRunResult) {
                result = {...result, ...postProcessRunResult(loaded)};
            }

            if (result.type === 'metric' && result.config && result.config.metricVersion === 2) {
                // @ts-ignore
                result.type = 'metric2';
            }

            if (result.type === 'ymap' && result.libraryConfig) {
                result.libraryConfig.apiKey = DL.YAMAP_API_KEY;
            }
        }

        if ('uiScheme' in loaded) {
            const uiScheme = (loaded as UI).uiScheme;
            if (uiScheme) {
                (result as WithControls).controls = Array.isArray(uiScheme)
                    ? {
                          controls: uiScheme,
                          lineBreaks: 'nowrap',
                      }
                    : uiScheme;
            }
        }

        return result as R & ChartsData;
    } catch (error) {
        throw DatalensChartkitCustomError.wrap(error, {
            code: CHARTS_ERROR_CODE.PROCESSING_ERROR,
            message: i18n('chartkit.data-provider', 'error-processing'),
        });
    }
}

async function applyChartkitHandlers(args: {
    config: Widget['config'];
    libraryConfig: Widget['libraryConfig'];
    graphs: undefined | unknown[];
}) {
    const {config, libraryConfig, graphs} = args;
    if (libraryConfig) {
        const {tooltipHeaderFormatter} = libraryConfig;

        if (typeof tooltipHeaderFormatter === 'string') {
            libraryConfig.tooltipHeaderFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardTooltipHeaderFormatter](
                    tooltipHeaderFormatter,
                );
        }

        if (libraryConfig.legend?.labelFormatter === ChartkitHandlers.WizardLabelFormatter) {
            libraryConfig.legend.labelFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardLabelFormatter];
        }

        if (libraryConfig.xAxis?.labels?.formatter === ChartkitHandlers.WizardXAxisFormatter) {
            libraryConfig.xAxis.labels.formatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardXAxisFormatter];
        }

        if (
            libraryConfig.xAxis?.labels?.formatter ===
            ChartkitHandlers.WizardAxisLabelMarkdownFormatter
        ) {
            const renderMarkdown = await getRenderMarkdownFn();
            libraryConfig.xAxis.labels.formatter = partial(
                ChartkitHandlersDict[ChartkitHandlers.WizardAxisLabelMarkdownFormatter],
                renderMarkdown,
            );
        }

        if (
            libraryConfig.yAxis?.labels?.formatter === ChartkitHandlers.DCMonitoringLabelFormatter
        ) {
            libraryConfig.yAxis.labels.formatter =
                ChartkitHandlersDict[ChartkitHandlers.DCMonitoringLabelFormatter];
        }

        if (
            libraryConfig.yAxis?.labels?.formatter ===
            ChartkitHandlers.WizardScatterYAxisLabelFormatter
        ) {
            libraryConfig.yAxis.labels.formatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardScatterYAxisLabelFormatter];
        }

        if (
            libraryConfig.exporting?.csv?.columnHeaderFormatter ===
            ChartkitHandlers.WizardExportColumnNamesFormatter
        ) {
            libraryConfig.exporting.csv.columnHeaderFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardExportColumnNamesFormatter];
        }

        if (
            libraryConfig.plotOptions?.scatter?.tooltip?.formatter ===
            ChartkitHandlers.WizardScatterTooltipFormatter
        ) {
            const hasMarkdown = (graphs ?? []).some((graph) =>
                get(graph, 'custom.hasMarkdown', false),
            );
            const renderItem = hasMarkdown ? await getRenderMarkdownFn() : undefined;
            delete libraryConfig.plotOptions.scatter.tooltip.formatter;
            libraryConfig.plotOptions.scatter.tooltip.headerFormat = '';
            libraryConfig.plotOptions.scatter.tooltip.pointFormatter = partial(
                ChartkitHandlersDict[ChartkitHandlers.WizardScatterTooltipFormatter],
                renderItem,
            );
        }
    }

    if (
        config &&
        (config as GraphWidget['config']).manageTooltipConfig ===
            ChartkitHandlers.WizardManageTooltipConfig
    ) {
        (config as GraphWidget['config']).manageTooltipConfig =
            ChartkitHandlersDict[ChartkitHandlers.WizardManageTooltipConfig];
    }

    if (graphs && Array.isArray(graphs)) {
        const possibleHandlers = {
            'dataLabels.formatter': [ChartkitHandlers.WizardDataLabelMarkdownFormatter],
            'tooltip.pointFormatter': [ChartkitHandlers.WizardTreemapTooltipFormatter],
        };
        await Promise.all(
            graphs.map(async (graph) => {
                const hasMarkdown = get(graph, 'custom.hasMarkdown', false);
                const renderItem = hasMarkdown ? await getRenderMarkdownFn() : baseRenderFn;
                Object.entries(possibleHandlers).forEach(([path, handlersToCheck]) => {
                    handlersToCheck.forEach((handler) => {
                        if (graph && get(graph, path) === handler) {
                            const handlerFn = partialRight(
                                ChartkitHandlersDict[handler],
                                renderItem,
                            );
                            set(graph, path, handlerFn);
                        }
                    });
                });
            }),
        );
    }
}

export default processNode;
