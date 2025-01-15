import {YFM_CUT_MARKDOWN_CLASSNAME, YFM_MARKDOWN_CLASSNAME} from 'constants/yfm';

import React from 'react';

import debounce from 'lodash/debounce';
import {useHistory} from 'react-router-dom';
import type {DashSettings} from 'shared';
import {FOCUSED_WIDGET_PARAM_NAME} from 'shared';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';
import {ExtendedDashKitContext} from 'ui/units/dash/utils/context';

import {useBeforeLoad} from '../../../../hooks/useBeforeLoad';
import type {
    ChartKitWrapperLoadStatusUnknown,
    ChartKitWrapperOnLoadProps,
} from '../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {ChartsData} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {LoadedWidgetData, OnChangeData} from '../../../../libs/DatalensChartkit/types';
import logger from '../../../../libs/logger';
import type {
    CurrentTab,
    WidgetPluginDataWithTabs,
    WidgetPluginProps,
} from '../../../DashKit/plugins/Widget/types';
import {
    getPreparedConstants,
    getWidgetMeta,
    getWidgetMetaOld,
    isWidgetTypeWithAutoHeight,
    pushStats,
    updateImmediateLayout,
} from '../helpers/helpers';
import type {
    ChartWidgetProps,
    CurrentRequestStateItem,
    ResolveMetaDataRef,
    ResolveWidgetDataRef,
} from '../types';

import {useResizeObserver} from './useAutoHeightResizeObserver';
import type {LoadingChartHookProps} from './useLoadingChart';
import {useLoadingChart} from './useLoadingChart';

type LoadingChartWidgetHookProps = Pick<
    WidgetPluginProps,
    'adjustWidgetLayout' | 'gridLayout' | 'layout' | 'getMarkdown'
> &
    Pick<
        LoadingChartHookProps,
        | 'chartKitRef'
        | 'hasChangedOuterProps'
        | 'hasChangedOuterParams'
        | 'hasChartTabChanged'
        | 'hasChangedActionParams'
        | 'initialData'
        | 'requestId'
        | 'requestCancellationRef'
        | 'rootNodeRef'
        | 'usedParamsRef'
        | 'innerParamsRef'
        | 'widgetDataRef'
        | 'widgetRenderTimeRef'
        | 'enableActionParams'
        | 'clearedOuterParams'
    > &
    ChartWidgetProps & {
        tabIndex: number;
        tabs: WidgetPluginProps['data']['tabs'];
        widgetId: WidgetPluginProps['id'];
        currentTab: CurrentTab;
        hasHideTitleChanged?: boolean;
    };

const WIDGET_DEBOUNCE_TIMEOUT = 300;
const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 600;
export const useLoadingChartWidget = (props: LoadingChartWidgetHookProps) => {
    const {
        data,
        dataProvider,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        hasChangedActionParams,
        hasHideTitleChanged,
        tabIndex,
        adjustWidgetLayout,
        widgetId,
        gridLayout,
        layout,
        currentTab,
        getMarkdown,
        noVeil,
        noLoader,
        compactLoader,
        loaderDelay,
        onStateAndParamsChange,
        chartKitRef,
        width,
        height,
        usedParamsRef,
        innerParamsRef,
        widgetDataRef,
        widgetRenderTimeRef,
        usageType,
        enableActionParams,
        settings,
        clearedOuterParams,
    } = props;

    const loadOnlyVisibleCharts = (settings as DashSettings).loadOnlyVisibleCharts ?? true;

    const tabs = props.tabs as WidgetPluginDataWithTabs['tabs'];

    const [loadedDescription, setLoadedDescription] = React.useState<string | null>(null);
    const [description, setDescription] = React.useState<string | null>(null);
    const [loadedWidgetType, setLoadedWidgetType] = React.useState<string>('');
    const [isLoadedWidgetWizard, setIsLoadedWidgetWizard] = React.useState(false);
    const [isRendered, setIsRendered] = React.useState(false);

    const resolveMetaDataRef = React.useRef<ResolveMetaDataRef>();
    const resolveWidgetDataRef = React.useRef<ResolveWidgetDataRef>();
    const mutationObserver = React.useRef<MutationObserver | null>(null);

    const extDashkitContext = React.useContext(ExtendedDashKitContext);
    const isNewRelations = extDashkitContext?.isNewRelations || false;
    const dataProviderContextGetter = extDashkitContext?.dataProviderContextGetter || undefined;

    const history = useHistory();

    const handleUpdate = useBeforeLoad(props.onBeforeLoad);
    const hideTitle = Boolean(data.hideTitle);

    /**
     * debounced call of recalculate widget layout after rerender
     */
    const adjustLayout = React.useCallback(
        (needSetDefault) => {
            dashkitAdjustWidgetLayout({
                widgetId,
                needSetDefault,
                rootNode: rootNodeRef,
                gridLayout,
                layout,
                cb: (...args) => {
                    return props.adjustWidgetLayout(...args);
                },
            });
        },
        [widgetId, rootNodeRef, gridLayout, adjustWidgetLayout],
    );

    /**
     * triggers from chartkit after each it's render
     */
    const handleRenderChartWidget = React.useCallback(
        (renderedData: ChartKitWrapperOnLoadProps | ChartKitWrapperLoadStatusUnknown) => {
            if (renderedData?.status === 'success') {
                pushStats(renderedData, 'dash', dataProvider);
            }

            const newAutoHeight =
                isWidgetTypeWithAutoHeight(loadedWidgetType) || renderedData?.status === 'error'
                    ? tabs[tabIndex].autoHeight
                    : false;

            adjustLayout(!newAutoHeight);
            setIsRendered(true);
        },
        [dataProvider, tabs, tabIndex, adjustLayout, loadedWidgetType],
    );

    /**
     * handle callback when chart inner params changed and affected to other widgets,
     * for ex. to external set param (param on selector) by table cell click
     * if there is action after triggering chart-by-chart filtering then we need to wait for dataset fields loaded on dash
     * and we need to trigger dashkit changes with merging params & etc only after loaded waiting ds loaded manually
     * that's why we need to remember changed fields to forward it to changed callback function for dashkit re-render later
     */
    const handleChangeCallback = React.useCallback(
        async (changedProps: OnChangeData) => {
            if (changedProps.type === 'PARAMS_CHANGED') {
                onStateAndParamsChange(
                    {
                        params: changedProps.data.params || {},
                    },
                    changedProps.options,
                );

                // If we resetting filtration we are loosing current open tab
                // To prevent forcible setting currentTabId
                if (currentTab.id && changedProps.options?.action === 'removeItem') {
                    onStateAndParamsChange({state: {tabId: currentTab.id}});
                }
            }
        },
        [currentTab.id, onStateAndParamsChange],
    );

    /**
     * handle callback when chart was loaded, and we know it's type for autoHeight adjust call
     */
    const handleChartLoad = React.useCallback(({data}: ChartKitWrapperOnLoadProps) => {
        setLoadedWidgetType(data?.loadedData?.type as string);
    }, []);

    /**
     * Memoised dataProviderContextGetter with widget id
     */
    const requestHeadersGetter = React.useMemo(() => {
        return dataProviderContextGetter?.bind(this, widgetId);
    }, [widgetId, dataProviderContextGetter]);

    const {
        loadedData,
        isLoading,
        isSilentReload,
        isReloadWithNoVeil,
        error,
        handleRenderChart,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        loadChartData,
        setLoadingProps,
        loadControls,
        drillDownFilters,
        drillDownLevel,
        setCurrentDrillDownLevel,
        yandexMapAPIWaiting,
        setCanBeLoaded,
        isInit,
        isWidgetMenuDataChanged,
        dataProps,
    } = useLoadingChart({
        dataProvider,
        requestHeadersGetter,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        hasChangedActionParams,
        onChartLoad: handleChartLoad,
        onChartRender: handleRenderChartWidget,
        chartKitRef,
        resolveMetaDataRef,
        resolveWidgetDataRef,
        usedParamsRef,
        innerParamsRef,
        handleChangeCallback,
        widgetDataRef,
        widgetRenderTimeRef,
        usageType,
        ignoreUsedParams: true, // tmp fix CHARTS-7290 TODO: CHARTS-6619 return this later with announcement of changes
        enableActionParams,
        clearedOuterParams,
    });

    const {
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        isFullscreen,
        widgetType,
        showOverlayWithControlsOnEdit,
        noControls,
    } = React.useMemo(
        () =>
            getPreparedConstants({
                isLoading,
                error,
                loadedData,
                isReloadWithNoVeil,
                noLoader,
                noVeil,
                isSilentReload,
                history,
                widgetId,
                hideTitle,
            }),
        [
            isLoading,
            error,
            loadedData,
            isReloadWithNoVeil,
            noLoader,
            noVeil,
            compactLoader,
            loaderDelay,
            history.location.search,
            hasHideTitleChanged,
            widgetId,
            hideTitle,
            isSilentReload,
        ],
    );

    /**
     * saving top position before fullscreen mode opening and restore it on exit fullscreen
     */
    const handleToggleFullscreenMode = React.useCallback(() => {
        const searchParams = new URLSearchParams(history.location.search);
        const isFullscreenNewMode = !searchParams.has(FOCUSED_WIDGET_PARAM_NAME);

        if (isFullscreenNewMode) {
            searchParams.set(FOCUSED_WIDGET_PARAM_NAME, widgetId);
        } else {
            searchParams.delete(FOCUSED_WIDGET_PARAM_NAME);
        }

        history.push({
            ...history.location,
            search: searchParams.toString(),
        });
    }, [history, widgetId]);

    /**
     * loading widget description (below widget content)
     */
    const loadDescription = React.useCallback(() => {
        if (currentTab.description) {
            getMarkdown?.({text: currentTab.description})
                .then(({result}) => setLoadedDescription(result))
                .catch((err) => {
                    logger.logError('DashKit: Widget loadDescription failed', err);
                    setLoadedDescription(currentTab.description);
                    updateImmediateLayout({
                        type: loadedWidgetType,
                        autoHeight: tabs[tabIndex].autoHeight,
                        widgetId,
                        gridLayout,
                        rootNode: rootNodeRef,
                        layout,
                        cb: props.adjustWidgetLayout,
                    });
                });
        } else {
            setLoadedDescription(currentTab.description);
            updateImmediateLayout({
                type: loadedWidgetType,
                autoHeight: tabs[tabIndex].autoHeight,
                widgetId,
                gridLayout,
                rootNode: rootNodeRef,
                layout,
                cb: props.adjustWidgetLayout,
            });
        }
    }, [currentTab, getMarkdown, setLoadedDescription, loadedWidgetType, tabs, tabIndex]);

    /**
     * debounced call of chartkit reflow
     */
    const isReadyToReflowRef = React.useRef(false);
    isReadyToReflowRef.current = isInit && !isLoading && isRendered;
    const debouncedChartReflow = React.useCallback(
        debounce(() => {
            handleChartkitReflow();

            // Triggering update after chart changed it size
            if (isReadyToReflowRef.current && handleUpdate) {
                requestAnimationFrame(() => handleUpdate());
            }
        }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
        [handleChartkitReflow, isReadyToReflowRef],
    );

    /**
     * load chart description on mount
     */
    React.useLayoutEffect(() => {
        loadDescription();
        return () => {
            mutationObserver.current?.disconnect();
        };
    }, [loadDescription]);

    /**
     * load chart description on change tab
     */
    React.useEffect(() => {
        if (!hasChartTabChanged) {
            return;
        }
        loadDescription();
    }, [hasChartTabChanged, loadDescription]);

    /**
     * changed widget content size
     */
    React.useEffect(() => {
        debouncedChartReflow();
    }, [width, height, debouncedChartReflow]);

    /**
     * changed position, title, background, description and loaded state watcher
     */
    const currentLayout = layout.find(({i}) => i === widgetId);
    const {enableDescription, background, title} = currentTab;
    const isReadyToHandleUpdate = isInit && !isLoading && isRendered;
    React.useEffect(() => {
        if (isReadyToHandleUpdate) {
            handleUpdate?.();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        currentLayout?.x,
        currentLayout?.y,
        background?.color,
        background?.enabled,
        hideTitle,
        title,
        enableDescription,
        description,
        isReadyToHandleUpdate,
        handleUpdate,
    ]);

    /**
     * updating widget description by markdown
     */
    React.useEffect(() => {
        if (loadedDescription === description) {
            return;
        }
        setDescription(loadedDescription);
        handleChartkitReflow();
    }, [loadedDescription, description, handleChartkitReflow]);

    /**
     * handle changed chart tab
     */
    const handleSelectTab = React.useCallback(
        (newTabId) => {
            if (isLoading) {
                return;
            }

            if (
                requestCancellationRef.current?.[requestId]?.status === 'loading' &&
                requestCancellationRef.current?.[requestId]?.requestCancellation !== null
            ) {
                requestCancellationRef.current[requestId].status = 'canceled';
                dataProvider.cancelRequests(
                    requestCancellationRef.current[requestId].requestCancellation as NonNullable<
                        CurrentRequestStateItem['requestCancellation']
                    >,
                );
            }
            setCurrentDrillDownLevel(0);
            onStateAndParamsChange({
                state: {
                    tabId: newTabId,
                },
            });
        },
        [
            onStateAndParamsChange,
            isLoading,
            requestId,
            requestCancellationRef,
            dataProvider,
            setCurrentDrillDownLevel,
        ],
    );

    /**
     * get dash widget meta data (new relations feature-flag)
     */
    const getCurrentWidgetResolvedMetaInfo = React.useCallback(
        (loadData: LoadedWidgetData<ChartsData>) => {
            const meta = getWidgetMeta({
                // @ts-expect-error
                tabs: data.tabs,
                id: widgetId,
                loadData,
                savedData: loadedData,
                error,
            });

            if (resolveMetaDataRef.current) {
                resolveMetaDataRef.current(meta);
            }
        },
        [tabs, tabIndex, resolveMetaDataRef.current, loadedData, error, widgetId],
    );

    /**
     * get dash widget meta data (current relations)
     */
    const resolveMeta = React.useCallback(
        (loadData: LoadedWidgetData<ChartsData>) => {
            const meta = getWidgetMetaOld({
                // @ts-expect-error
                tabs: data.tabs,
                tabIndex,
                loadData,
            });

            if (resolveMetaDataRef.current) {
                resolveMetaDataRef.current(meta);
            }
        },
        [tabs, tabIndex, resolveMetaDataRef.current],
    );

    /**
     * get dash widget meta info (used for relations)
     */
    const handleGetWidgetMeta = React.useCallback(
        (argResolve) => {
            resolveMetaDataRef.current = argResolve;
            resolveWidgetDataRef.current = (resolvingData: LoadedWidgetData<ChartsData>) => {
                if (isNewRelations) {
                    getCurrentWidgetResolvedMetaInfo(resolvingData);
                } else {
                    resolveMeta(resolvingData);
                }
            };
            if (!isInit) {
                // initializing chart loading if it was not inited yet (ex. was not in viewport
                setCanBeLoaded(true);
            }
            // do not resolve Promise for collecting meta info until chart loaded (for relations dialog)
            if (!loadedData) {
                // resolve if no loaded data but get error
                if (error) {
                    resolveWidgetDataRef.current(null);
                }
                return;
            }
            resolveWidgetDataRef.current(loadedData);
        },
        [
            error,
            loadedData,
            isNewRelations,
            setCanBeLoaded,
            isInit,
            resolveMeta,
            getCurrentWidgetResolvedMetaInfo,
            resolveMetaDataRef,
            resolveWidgetDataRef,
        ],
    );

    /**
     * if any of children rootNode has yfm classname, we need to fire adjustLayout check
     * (magiclinks change content after adjust layout has been updated, that cause unnecessary scrolls)
     */
    const debouncedMutationsCheck = React.useCallback(
        debounce((mutations: Array<MutationRecord>) => {
            if (!rootNodeRef.current || !loadedData) {
                return;
            }
            let needUpdate = false;
            Array.from(mutations).forEach((mutatedItem) => {
                if (needUpdate) {
                    return;
                }
                let targetEl = mutatedItem?.target as Element;
                const hasYfm =
                    targetEl?.classList.contains(YFM_MARKDOWN_CLASSNAME) ||
                    targetEl?.classList.contains(YFM_CUT_MARKDOWN_CLASSNAME);

                if (hasYfm) {
                    needUpdate = true;
                }

                while (
                    !needUpdate &&
                    targetEl &&
                    rootNodeRef.current &&
                    targetEl?.parentElement !== rootNodeRef.current
                ) {
                    targetEl = targetEl?.parentElement as Element;
                    if (targetEl?.classList.contains(YFM_MARKDOWN_CLASSNAME)) {
                        needUpdate = true;
                    }
                }
            });

            if (!needUpdate) {
                return;
            }
            updateImmediateLayout({
                type: loadedWidgetType,
                autoHeight: tabs[tabIndex].autoHeight,
                widgetId,
                gridLayout,
                rootNode: rootNodeRef,
                layout,
                cb: props.adjustWidgetLayout,
            });
        }, WIDGET_DEBOUNCE_TIMEOUT),
        [
            rootNodeRef,
            loadedWidgetType,
            tabs,
            tabIndex,
            widgetId,
            gridLayout,
            layout,
            props.adjustWidgetLayout,
        ],
    );

    /**
     * watching content changes to check if adjustLayout needed for autoheight widgets update
     */
    React.useEffect(() => {
        if (!isInit || !mutationObserver) {
            return;
        }
        mutationObserver.current = new MutationObserver(debouncedMutationsCheck);

        if (rootNodeRef.current) {
            mutationObserver.current.observe(rootNodeRef.current, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['class'],
            });
        }
        return () => {
            mutationObserver.current?.disconnect();
        };
    }, [debouncedMutationsCheck, mutationObserver, isInit, rootNodeRef]);

    React.useEffect(() => {
        if (loadedData?.isNewWizard && !isLoadedWidgetWizard) {
            setIsLoadedWidgetWizard(true);
        }
    }, [loadedData?.isNewWizard, isLoadedWidgetWizard]);

    /**
     * Resize observer adjustLayout
     * If widget is loaded and is valid type or has error -> taking autoHeight prop value
     */

    const debounceResizeAdjustLayot = React.useCallback(
        debounce(() => {
            updateImmediateLayout({
                type: loadedWidgetType,
                autoHeight: tabs[tabIndex].autoHeight,
                widgetId,
                gridLayout,
                rootNode: rootNodeRef,
                layout,
                cb: props.adjustWidgetLayout,
            });
        }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
        [
            widgetId,
            loadedWidgetType,
            tabs,
            tabIndex,
            gridLayout,
            rootNodeRef,
            layout,
            props.adjustWidgetLayout,
        ],
    );

    const isAutoHeightEnabled = Boolean(tabs[tabIndex].autoHeight);
    useResizeObserver({
        onResize: debounceResizeAdjustLayot,
        rootNodeRef,
        enable: isInit && isAutoHeightEnabled,
    });

    /**
     * set force load all charts (no matter if they are in viewport or not) if there is loadOnlyVisibleCharts setting disabled
     */
    React.useEffect(() => {
        if (loadOnlyVisibleCharts === false) {
            setCanBeLoaded(true);
        }
    }, [setCanBeLoaded, loadOnlyVisibleCharts]);

    return {
        loadedData,
        isLoading,
        isInit,
        isSilentReload,
        isReloadWithNoVeil,
        isAutoHeightEnabled,
        error,
        handleRenderChart,
        description,
        handleToggleFullscreenMode,
        handleSelectTab,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        handleGetWidgetMeta,
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        isFullscreen,
        loadChartData,
        setLoadingProps,
        loadControls,
        drillDownFilters,
        drillDownLevel,
        widgetType,
        yandexMapAPIWaiting,
        showOverlayWithControlsOnEdit,
        isWidgetMenuDataChanged,
        dataProps,
        noControls,
    };
};
