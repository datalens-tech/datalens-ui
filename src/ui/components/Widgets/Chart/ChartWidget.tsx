import React from 'react';

import type {ChartKitRef} from '@gravity-ui/chartkit';
import {
    pickActionParamsFromParams,
    pickExceptActionParamsFromParams,
} from '@gravity-ui/dashkit/helpers';
import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {ChartkitMenuDialogsQA, type StringParams} from 'shared';
import {Feature} from 'shared/types/feature';
import {DL} from 'ui/constants/common';
import {ExtendedDashKitContext} from 'ui/units/dash/utils/context';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {ChartKit} from '../../../libs/DatalensChartkit/ChartKit/ChartKit';
import Loader from '../../../libs/DatalensChartkit/components/ChartKitBase/components/Loader/Loader';
import {getDataProviderData} from '../../../libs/DatalensChartkit/components/ChartKitBase/helpers';
import settings from '../../../libs/DatalensChartkit/modules/settings/settings';
import DebugInfoTool from '../../DashKit/plugins/DebugInfoTool/DebugInfoTool';
import type {CurrentTab, WidgetPluginDataWithTabs} from '../../DashKit/plugins/Widget/types';
import {getPreparedWrapSettings} from '../../DashKit/utils';
import {MarkdownHelpPopover} from '../../MarkdownHelpPopover/MarkdownHelpPopover';

import {Content} from './components/Content';
import {WidgetFooter} from './components/WidgetFooter';
import type {HeaderWithControlsProps} from './components/WidgetHeader';
import {WidgetHeader} from './components/WidgetHeader';
import {
    COMPONENT_CLASSNAME,
    getTabIndex,
    removeEmptyNDatasetFieldsProperties,
} from './helpers/helpers';
import {useLoadingChartWidget} from './hooks/useLoadingChartWidget';
import type {
    ChartWidgetData,
    ChartWidgetProps,
    ChartWidgetPropsWithContext,
    ChartWidgetWithWrapRefProps,
    CurrentRequestState,
    DataProps,
} from './types';

import './ChartWidget.scss';

const b = block(COMPONENT_CLASSNAME);

/**
 * changing any fields in list triggers loading widget chart data (by api/run)
 */
const influencingProps: Array<keyof ChartWidgetPropsWithContext> = [
    'dataProvider',
    'id',
    'source',
    'params',
    'config',
];

/**
 * Component used only on dashboard for charts rendering with extra dash widget logic
 * @param props
 * @constructor
 */
// eslint-disable-next-line complexity
export const ChartWidget = (props: ChartWidgetProps) => {
    const {
        data,
        state,
        dataProvider,
        forwardedRef,
        noControls,
        nonBodyScroll,
        transformLoadedData,
        splitTooltip,
        compactLoader,
        loaderDelay,
        id: widgetId,
        editMode,
        context,
        config,
        usageType,
        workbookId,
        enableAssistant,
    } = props;

    const extDashkitContext = React.useContext(ExtendedDashKitContext);
    const skipReload = extDashkitContext?.skipReload ?? false;
    const setWidgetCurrentTab = extDashkitContext?.setWidgetCurrentTab;

    const [isWizardChart, setIsWizardChart] = React.useState(false);

    const tabs = data.tabs as WidgetPluginDataWithTabs['tabs'];
    const tabIndex = React.useMemo(() => getTabIndex(tabs, state.tabId), [tabs, state.tabId]);
    // this current tab we get from dashkit rerender with extra params for ds
    const currentTab = React.useMemo(() => tabs[tabIndex], [tabs, tabIndex]);
    const initName = React.useMemo(() => currentTab.title, [currentTab]);
    const {chartId, enableActionParams} = currentTab;

    const chartkitParams = React.useMemo(() => {
        let res = removeEmptyNDatasetFieldsProperties(props.params);
        if (!enableActionParams) {
            res = pickExceptActionParamsFromParams(res);
        }
        return res;
    }, [props.params, enableActionParams]);

    const prevTabIndex = usePrevious(tabIndex);
    const hasChartTabChanged = prevTabIndex !== undefined && prevTabIndex !== tabIndex;

    const prevCurrentTabDefaults = usePrevious(currentTab.params);
    const hasCurrentTabDefaultsChanged =
        prevCurrentTabDefaults && !isEqual(currentTab.params, prevCurrentTabDefaults);

    const prevHideTitle = usePrevious(data.hideTitle);
    const hasHideTitleChanged =
        prevHideTitle !== undefined && !isEqual(data.hideTitle, prevHideTitle);

    const prevEnableActionParams = usePrevious(currentTab.enableActionParams);
    // if there was no param in config it will be undefined too (not only when we first render with undefined initializing)
    // so we check two cases: when prev val is true and new val is not true or current val is true and prev is not true
    const hasEnableActionParamsChanged = Boolean(
        (prevEnableActionParams !== undefined &&
            prevEnableActionParams !== currentTab.enableActionParams) ||
            (prevEnableActionParams === undefined && currentTab.enableActionParams),
    );

    const initialData: DataProps = React.useMemo(
        () =>
            getDataProviderData({
                id: chartId,
                config,
                params: chartkitParams,
                workbookId,
            }),
        [chartId, chartkitParams, config, hasChartTabChanged, workbookId],
    );

    const savedForFetchProps = React.useMemo(() => pick(props, influencingProps), [props]);
    const prevSavedProps = usePrevious(savedForFetchProps);

    const prevSavedChartId = usePrevious(chartId);

    const usedParamsRef = React.useRef<DataProps['params'] | null>(null);
    const innerParamsRef = React.useRef<DataProps['params'] | null>(null);
    const prevInnerParams = usePrevious(innerParamsRef?.current);

    const hasChangedOuterProps =
        !prevSavedProps ||
        !isEqual(omit(prevSavedProps, 'params'), omit(pick(props, influencingProps), 'params')) ||
        Boolean(prevSavedChartId && prevSavedChartId !== chartId) ||
        hasEnableActionParamsChanged;

    let hasChangedActionParams = false;

    const hasChangedOuterParams = React.useMemo(() => {
        const propsParams = props.params;
        const prevSavedPropsParams = prevSavedProps?.params;
        const isEqualParamsWithPrev = prevSavedProps && isEqual(prevSavedPropsParams, propsParams);

        let changedParams = !prevSavedProps || !isEqualParamsWithPrev;

        /* to do after usedParams has fixed CHARTS-6619
        const prevActionedParams = getParamsNamesFromActionParams(prevSavedProps?.params || {});
        const currentActionedParams = getParamsNamesFromActionParams(props.params || {});
        const prevParamsFilteredByUsed = null;
        const currentParamsFilteredByUsed = null;
        const prevActionedParamsFilteredByUsed = null;
        const currentActionedParamsFilteredByUsed = null;

        if (usedParamsRef?.current) {
            const keys = Object.keys(usedParamsRef.current || {});
            changedParams =
                !prevSavedProps ||
                !isEqual(pick(prevSavedProps.params, keys), pick(props.params, keys));

            ///    start new with usedParams
            const usedParamsKeys = Object.keys(usedParamsRef.current || {});
            prevParamsFilteredByUsed = pick(prevSavedProps?.params || {}, usedParamsKeys);
            currentParamsFilteredByUsed = pick(props.params, usedParamsKeys);

            prevActionedParamsFilteredByUsed = pick(prevActionedParams, usedParamsKeys);
            currentActionedParamsFilteredByUsed = pick(currentActionedParams, usedParamsKeys);

            const isParamsEqual = isEqual(prevParamsFilteredByUsed, currentParamsFilteredByUsed);
            const isActionParamsEqual = isEqual(
                prevActionedParamsFilteredByUsed,
                currentActionedParamsFilteredByUsed,
            );

            changedParams = !prevSavedProps || !isParamsEqual || !isActionParamsEqual;
            /// end new with usedParams
        }
        */
        let isOuterAndInnerParamsEqual = false;
        let isOuterAndInnerActionParamsEqual = true;
        if (changedParams && innerParamsRef?.current) {
            const innerFullParams = innerParamsRef?.current;
            const outerFullParams = propsParams;

            isOuterAndInnerParamsEqual = isEqual(innerFullParams, outerFullParams);

            const innerActionParams = pickActionParamsFromParams(innerFullParams, true);
            const outerActionParams = pickActionParamsFromParams(outerFullParams, true);

            isOuterAndInnerActionParamsEqual = isEqual(innerActionParams, outerActionParams);
            if (!isOuterAndInnerActionParamsEqual) {
                hasChangedActionParams = true;
            }

            // to do after usedParams has fixed CHARTS-6619
            /*if (currentParamsFilteredByUsed !== null) {
                const filteredInnerParamsByUsed = pick(
                    innerParamsRef.current,
                    Object.keys(currentParamsFilteredByUsed),
                );

                isOuterAndInnerParamsEqual = isEqual(
                    filteredInnerParamsByUsed,
                    currentParamsFilteredByUsed,
                );

                if (currentActionedParamsFilteredByUsed !== null && isOuterAndInnerParamsEqual) {
                    const filteredInnerActionParams = getParamsNamesFromActionParams(
                        innerParamsRef.current || {},
                    );
                    const filteredInnerActionParamsByUsed = pick(
                        filteredInnerActionParams,
                        Object.keys(currentParamsFilteredByUsed),
                    );

                    isOuterAndInnerParamsEqual = isEqual(
                        filteredInnerActionParamsByUsed,
                        currentActionedParamsFilteredByUsed,
                    );
                }
            }*/
        }

        if (isOuterAndInnerParamsEqual && isOuterAndInnerActionParamsEqual) {
            changedParams = false;
        }

        return changedParams;
    }, [prevSavedProps?.params, props.params, usedParamsRef, innerParamsRef, isWizardChart]);

    const clearedOuterParams = React.useMemo(() => {
        let clearedParams;
        const propsParams = props.params;
        const prevSavedPropsParams = prevSavedProps?.params;
        const isEqualParamsWithPrev = prevSavedProps && isEqual(prevSavedPropsParams, propsParams);

        const hasParamsChanged = !prevSavedProps || !isEqualParamsWithPrev;

        const isOuterAndInnerParamsEqual =
            hasParamsChanged && innerParamsRef?.current
                ? isEqual(innerParamsRef?.current, propsParams)
                : false;

        if (!hasChangedActionParams && !isOuterAndInnerParamsEqual) {
            clearedParams = prevSavedProps
                ? Object.keys(omit(prevSavedProps.params, Object.keys(props?.params || {})))
                : [];
        }

        return clearedParams;
    }, [
        hasChangedActionParams,
        prevSavedProps?.params,
        props.params,
        usedParamsRef,
        innerParamsRef,
        isWizardChart,
    ]);

    const hasChangedInnerParamsFromInside = React.useMemo(() => {
        return prevInnerParams && !isEqual(innerParamsRef?.current, prevInnerParams);
    }, [prevInnerParams, innerParamsRef?.current]);

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    const requestId = React.useMemo(
        () => settings.requestIdGenerator(DL.REQUEST_ID_PREFIX),
        [
            hasChangedOuterParams,
            hasChangedOuterProps,
            hasChangedActionParams,
            hasChartTabChanged,
            hasChangedInnerParamsFromInside,
        ],
    );

    const currentActionParams =
        (enableActionParams &&
            chartkitParams &&
            pickActionParamsFromParams(chartkitParams, true)) ||
        {};

    const showActionParamsFilter = !isEmpty(
        Object.values(currentActionParams).filter((item) => {
            if (typeof item === 'string') {
                return !isEmpty(item);
            }
            if (typeof item === 'number') {
                return true;
            }
            return !isEmpty(item.filter((paramItem) => !isEmpty(paramItem.trim())));
        }),
    );

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    const requestCancellationRef = React.useRef<CurrentRequestState>({
        [requestId]: {
            requestCancellation: dataProvider.getRequestCancellation(),
            status: 'unset',
        },
    });

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    React.useEffect(() => {
        requestCancellationRef.current[requestId] = {
            requestCancellation: dataProvider.getRequestCancellation(),
            status: 'unset',
        };
    }, [requestCancellationRef, dataProvider, requestId]);

    const rootNodeRef = React.useRef<HTMLDivElement>(null);
    const chartKitRef = React.useRef<ChartKit>(null);
    const widgetDataRef = React.useRef<ChartWidgetData>(null);
    const widgetRenderTimeRef = React.useRef<number | null>(null);

    const [initialParams, setInitialParams] = React.useState<StringParams>({});

    const [isExportLoading, setIsExportLoading] = React.useState(false);

    const {
        loadedData,
        error,
        handleRenderChart,
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        isFullscreen,
        isAutoHeightEnabled,
        description,
        descriptionMetaScript,
        handleToggleFullscreenMode,
        handleSelectTab,
        handleGetWidgetMeta,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        loadChartData,
        setLoadingProps,
        loadControls,
        drillDownFilters,
        drillDownLevel,
        widgetType,
        yandexMapAPIWaiting,
        isLoading,
        isInit,
        showOverlayWithControlsOnEdit,
        isWidgetMenuDataChanged,
        dataProps,
        noControls: urlNoControls,
    } = useLoadingChartWidget({
        ...props,
        chartKitRef,
        rootNodeRef,
        initialData,
        requestId,
        requestCancellationRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        hasChangedActionParams,
        hasHideTitleChanged,
        tabIndex,
        tabs,
        widgetId,
        currentTab,
        usedParamsRef,
        innerParamsRef,
        widgetDataRef,
        widgetRenderTimeRef,
        usageType,
        enableActionParams,
        clearedOuterParams,
    });

    const handleFiltersClear = React.useCallback(() => {
        const newActionParams: StringParams = {};
        Object.keys(chartkitParams || {}).forEach(function (key) {
            newActionParams[key] = '';
        });

        handleChange(
            {
                type: 'PARAMS_CHANGED',
                data: {params: pickActionParamsFromParams(newActionParams, true)},
            },
            {forceUpdate: false},
            true,
            true,
        );
    }, [handleChange, chartkitParams]);

    /**
     * Clear action params on disable of filtration of widget
     */
    React.useEffect(() => {
        if (hasEnableActionParamsChanged && !enableActionParams) {
            handleFiltersClear();
        }
    }, [hasEnableActionParamsChanged, enableActionParams, handleFiltersClear]);

    React.useEffect(() => {
        if (loadedData?.isNewWizard && !isWizardChart) {
            setIsWizardChart(true);
        }
    }, [loadedData?.isNewWizard, isWizardChart]);

    /**
     * Set initialParams on load chart defaults or when chart tab default params changed
     */
    React.useEffect(() => {
        if (!hasCurrentTabDefaultsChanged && !loadedData) {
            return;
        }
        setInitialParams({...loadedData?.defaultParams, ...currentTab.params});
    }, [hasCurrentTabDefaultsChanged, currentTab.params, loadedData, loadedData?.defaultParams]);

    // Update currentTab in dash state after dashkit item state update
    React.useEffect(() => {
        setWidgetCurrentTab?.({widgetId, tabId: currentTab.id});
    }, [currentTab, setWidgetCurrentTab, widgetId]);

    const handleClickHint = (e: React.MouseEvent) => {
        e.stopPropagation();
        return false;
    };

    const adaptiveTabsItems = React.useMemo(
        () =>
            tabs.map((item: CurrentTab) => ({
                id: item.id,
                title: item.title.trim() || '\u2014',
                displayedTitle: (
                    <span className={b('chart-title-wrap')}>
                        <span
                            className={b('chart-title-text', {
                                'with-hint': Boolean(item.hint && item.enableHint),
                            })}
                        >
                            {(typeof item.title === 'string' ? item.title.trim() : item.title) ||
                                '\u2014'}
                        </span>
                        {item.enableHint && item.hint && (
                            <MarkdownHelpPopover
                                markdown={item.hint}
                                className={b('chart-title-hint')}
                                buttonProps={{
                                    className: b('chart-title-hint-button'),
                                }}
                                onClick={handleClickHint}
                            />
                        )}
                    </span>
                ),
                disabled: Boolean(isLoading),
            })),
        [tabs, isLoading],
    );

    React.useImperativeHandle<ChartKit | ChartKitRef, ChartWidgetWithWrapRefProps>(
        forwardedRef,
        () => ({
            props,
            reflow: handleChartkitReflow,
            reload: (arg: {silentLoading?: boolean; noVeil?: boolean}) => {
                if (skipReload) {
                    return;
                }
                setLoadingProps(arg);
                loadChartData();
            },
            getMeta: () => new Promise((resolve) => handleGetWidgetMeta(resolve)),
            getCurrentTabChartId: () => chartId || '',
        }),
        [
            forwardedRef,
            handleChartkitReflow,
            handleGetWidgetMeta,
            skipReload,
            loadChartData,
            setLoadingProps,
            chartId,
            loadedData, // loadedData in deps for meta actual data
        ],
    );

    const menuChartkitConfig = React.useMemo(
        () => ({
            config: {
                canEdit: context.canEdit,
            },
            chartsDataProvider: dataProvider,
        }),
        [context.canEdit, editMode, context.entryDialoguesRef, initName],
    );

    const widgetDashState = React.useMemo(() => {
        if (widgetType !== 'table') {
            return undefined;
        }

        // Tables could need some optimization while in edit mode
        // TODO remove this when grouped tables could use virtualization
        return {
            isPreviewMode: editMode,
        };
    }, [editMode, widgetType]);

    const showBgColor = Boolean(
        currentTab?.enabled !== false &&
            currentTab.background?.color &&
            currentTab.background?.color !== 'transparent',
    );

    const {classMod, style} = getPreparedWrapSettings(showBgColor, currentTab.background?.color);

    const disableControls = noControls || urlNoControls;

    const showFloatControls = isEnabledFeature(Feature.DashFloatControls);

    const commonHeaderContentProps = {
        compactLoader,
        loaderDelay,
        menuType: 'dash',
        menuChartkitConfig,
        dataProvider,
        error,
        dataProps,
        requestId,
        loadedData,
        widgetDataRef,
        widgetRenderTimeRef,
        yandexMapAPIWaiting,
        enableActionParams,
        enableAssistant,
        isWidgetMenuDataChanged,
        onChange: handleChange,
        onFullscreenClick: handleToggleFullscreenMode,
        showActionParamsFilter,
        noControls: disableControls,
        onFiltersClear: handleFiltersClear,
    };

    const withInsights = Boolean(loadedData?.chartsInsightsData);
    const withFiltering = Boolean(showActionParamsFilter);
    const withBtnsMod =
        withInsights && withFiltering
            ? 'btns-full'
            : withInsights || withFiltering
              ? 'btns-partly'
              : '';

    const widgetHeaderProps = {
        isFullscreen,
        editMode,
        hideTitle: Boolean(data.hideTitle),
        tabsItems: adaptiveTabsItems,
        currentTab,
        onSelectTab: handleSelectTab,
        widgetId,
        hideDebugTool: true,
        ...commonHeaderContentProps,
        setIsExportLoading,
        ...(showFloatControls
            ? {
                  showLoader,
                  veil,
                  extraMod: withBtnsMod,
              }
            : {}),
    };

    const showContentLoader = widgetHeaderProps.showLoader || isExportLoading;
    const showLoaderVeil =
        widgetHeaderProps.showLoader && widgetHeaderProps.veil && !isExportLoading;
    const isFirstLoadingFloat = showFloatControls && loadedData === null;

    return (
        <div
            ref={rootNodeRef}
            className={`${b({
                ...mods,
                autoheight: isAutoHeightEnabled,
                classMod,
                ['wait-for-init']: !isInit,
                'default-mobile': DL.IS_MOBILE && !isFullscreen,
                pulsate: (showContentLoader || showLoaderVeil) && !isFirstLoadingFloat,
                'loading-mobile-height': DL.IS_MOBILE && isFirstLoadingFloat,
            })}`}
            style={style}
            data-qa={ChartkitMenuDialogsQA.chartWidget}
            data-qa-mod={isFullscreen ? 'fullscreen' : ''}
        >
            <DebugInfoTool
                data={[
                    {label: 'widgetId', value: widgetId},
                    {label: 'tabId', value: currentTab.id},
                    {label: 'chartId', value: chartId},
                ]}
            />
            <WidgetHeader {...(widgetHeaderProps as HeaderWithControlsProps)} />
            {isFirstLoadingFloat && (
                <Loader
                    visible={showContentLoader}
                    compact={false}
                    size="s"
                    veil={false}
                    delay={1000}
                />
            )}
            <Content
                initialParams={initialParams}
                showLoader={showLoader}
                showOverlayWithControlsOnEdit={showOverlayWithControlsOnEdit}
                veil={veil}
                widgetBodyClassName={widgetBodyClassName}
                hasHiddenClassMod={hasHiddenClassMod}
                chartId={chartId}
                transformLoadedData={transformLoadedData}
                splitTooltip={splitTooltip || isFullscreen}
                nonBodyScroll={nonBodyScroll}
                onRender={handleRenderChart}
                onRetry={handleRetry}
                onError={handleError}
                forwardedRef={chartKitRef}
                getControls={loadControls}
                drillDownFilters={drillDownFilters}
                drillDownLevel={drillDownLevel}
                widgetType={widgetType}
                widgetDashState={widgetDashState}
                rootNodeRef={rootNodeRef}
                backgroundColor={style?.backgroundColor}
                needRenderContentControls={!showFloatControls}
                {...commonHeaderContentProps}
            />
            {Boolean(description || loadedData?.publicAuthor) && (
                <WidgetFooter
                    isFullscreen={Boolean(isFullscreen)}
                    description={description || ''}
                    metaScripts={descriptionMetaScript}
                    enableDescription={currentTab.enableDescription}
                    author={loadedData?.publicAuthor}
                />
            )}
        </div>
    );
};
