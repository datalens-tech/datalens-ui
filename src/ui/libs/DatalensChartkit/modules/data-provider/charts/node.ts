import type {Chart, Series, SeriesClickEventObject} from 'highcharts';
import Highcharts from 'highcharts';
import {i18n} from 'i18n';
import JSONfn from 'json-fn';
import logger from 'libs/logger';
import {UserSettings} from 'libs/userSettings';
import {omit, partial, partialRight} from 'lodash';
import get from 'lodash/get';
import type {Optional} from 'utility-types';

import type {StringParams} from '../../../../../../shared';
import {
    ChartkitHandlers,
    ChartkitHandlersDict,
    EDITOR_CHART_NODE,
    QL_CHART_NODE,
    WIZARD_CHART_NODE,
} from '../../../../../../shared';
import {DL} from '../../../../../constants/common';
import {registry} from '../../../../../registry';
import Utils from '../../../../../utils';
import type {ControlsOnlyWidget, GraphWidget, Widget, WithControls} from '../../../types';
import DatalensChartkitCustomError from '../../datalens-chartkit-custom-error/datalens-chartkit-custom-error';

import {getChartsInsightsData} from './helpers';
import type {ChartsData, ResponseSuccessControls, ResponseSuccessNode, UI} from './types';
import {
    getUISandbox,
    processHtmlFields,
    shouldUseUISandbox,
    unwrapPossibleFunctions,
} from './ui-sandbox';
import {getSafeChartWarnings} from './utils';

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
        const {showSafeChartInfo} = Utils.getOptionsFromSearch(window.location.search);
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

            if (
                shouldUseUISandbox(result.config) ||
                shouldUseUISandbox(result.libraryConfig) ||
                shouldUseUISandbox(result.data)
            ) {
                const uiSandbox = await getUISandbox();
                unwrapPossibleFunctions(uiSandbox, result.config);
                unwrapPossibleFunctions(uiSandbox, result.libraryConfig);
                unwrapPossibleFunctions(uiSandbox, result.data);
            }

            processHtmlFields(result.data, {allowHtml: enableJsAndHtml});
            processHtmlFields(result.libraryConfig, {allowHtml: enableJsAndHtml});

            applyChartkitHandlers(result.config, result.libraryConfig);

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

            if (showSafeChartInfo) {
                result.safeChartInfo = getSafeChartWarnings(result);
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

function applyChartkitHandlers(
    configRef: Widget['config'],
    libraryConfigRef: Widget['libraryConfig'],
) {
    if (libraryConfigRef) {
        const {tooltipHeaderFormatter} = libraryConfigRef;

        if (typeof tooltipHeaderFormatter === 'string') {
            libraryConfigRef.tooltipHeaderFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardTooltipHeaderFormatter](
                    tooltipHeaderFormatter,
                );
        }

        if (libraryConfigRef.legend?.labelFormatter === ChartkitHandlers.WizardLabelFormatter) {
            libraryConfigRef.legend.labelFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardLabelFormatter];
        }

        if (libraryConfigRef.xAxis?.labels?.formatter === ChartkitHandlers.WizardXAxisFormatter) {
            libraryConfigRef.xAxis.labels.formatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardXAxisFormatter];
        }

        if (
            libraryConfigRef.yAxis?.labels?.formatter ===
            ChartkitHandlers.DCMonitoringLabelFormatter
        ) {
            libraryConfigRef.yAxis.labels.formatter =
                ChartkitHandlersDict[ChartkitHandlers.DCMonitoringLabelFormatter];
        }

        if (
            libraryConfigRef.exporting?.csv?.columnHeaderFormatter ===
            ChartkitHandlers.WizardExportColumnNamesFormatter
        ) {
            libraryConfigRef.exporting.csv.columnHeaderFormatter =
                ChartkitHandlersDict[ChartkitHandlers.WizardExportColumnNamesFormatter];
        }
    }

    if (
        configRef &&
        (configRef as GraphWidget['config']).manageTooltipConfig ===
            ChartkitHandlers.WizardManageTooltipConfig
    ) {
        (configRef as GraphWidget['config']).manageTooltipConfig =
            ChartkitHandlersDict[ChartkitHandlers.WizardManageTooltipConfig];
    }
}

export default processNode;
