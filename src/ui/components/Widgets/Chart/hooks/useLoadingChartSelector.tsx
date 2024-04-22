import React from 'react';

import {AxiosResponse} from 'axios';
import debounce from 'lodash/debounce';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {DashSettings, DashTabItemControl} from 'shared';
import {adjustWidgetLayout as dashkitAdjustWidgetLayout} from 'ui/components/DashKit/utils';

import {
    ChartKitWrapperLoadStatusUnknown,
    ChartKitWrapperOnLoadProps,
} from '../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import {ResponseError} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {
    selectCurrentTab,
    selectIsNewRelations,
} from '../../../../units/dash/store/selectors/dashTypedSelectors';
import {WidgetPluginProps} from '../../../DashKit/plugins/Widget/types';
import {
    getPreparedConstants,
    getWidgetSelectorMeta,
    getWidgetSelectorMetaOld,
    pushStats,
} from '../helpers/helpers';
import {
    ChartWidgetProps,
    ResolveMetaDataRef,
    ResolveWidgetControlDataRef,
    ResolveWidgetControlDataRefArgs,
} from '../types';

import {useResizeObserver} from './useAutoHeightResizeObserver';
import {LoadingChartHookProps, useLoadingChart} from './useLoadingChart';

type LoadingChartSelectorHookProps = Pick<
    WidgetPluginProps,
    'adjustWidgetLayout' | 'gridLayout' | 'layout'
> &
    Pick<
        LoadingChartHookProps,
        | 'chartKitRef'
        | 'hasChangedOuterProps'
        | 'hasChangedOuterParams'
        | 'initialData'
        | 'requestId'
        | 'requestCancellationRef'
        | 'rootNodeRef'
        | 'usedParamsRef'
        | 'innerParamsRef'
        | 'widgetDataRef'
        | 'widgetType'
    > &
    ChartWidgetProps & {
        widgetId: WidgetPluginProps['id'];
        chartId: string;
    };

const WIDGET_RESIZE_DEBOUNCE_TIMEOUT = 600;
export const useLoadingChartSelector = (props: LoadingChartSelectorHookProps) => {
    const {
        dataProvider,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        adjustWidgetLayout,
        widgetId,
        gridLayout,
        layout,
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
        usageType,
        chartId,
        widgetType,
        settings,
    } = props;

    const resolveMetaDataRef = React.useRef<ResolveMetaDataRef>();
    const resolveWidgetDataRef = React.useRef<ResolveWidgetControlDataRef>();

    const isNewRelations = useSelector(selectIsNewRelations);

    const history = useHistory();

    const loadOnlyVisibleCharts = (settings as DashSettings).loadOnlyVisibleCharts ?? true;

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
                cb: adjustWidgetLayout,
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

            const newAutoHeight = Boolean(props.data.autoHeight);
            adjustLayout(!newAutoHeight);
        },
        [adjustLayout, dataProvider, props.data.autoHeight],
    );

    /**
     * handle callback when chart inner params changed and affected to other widgets,
     * for ex. to external set param (param on selector) by table cell click
     */
    const handleChangeCallback = React.useCallback(
        (changedProps) => {
            if (changedProps.type === 'PARAMS_CHANGED') {
                onStateAndParamsChange({params: changedProps.data.params || {}});
            }
        },
        [onStateAndParamsChange],
    );

    /**
     * handle callback when chart was loaded and we know it's type for autoHeight adjust call
     */
    const handleChartLoad = React.useCallback(
        ({data, status}: ChartKitWrapperOnLoadProps) => {
            if (
                status === 'error' ||
                (data?.loadedData as unknown as AxiosResponse<ResponseError>)?.data?.error
            ) {
                adjustLayout(false);
                return;
            }

            const newAutoHeight = Boolean(props.data.autoHeight);
            adjustLayout(!newAutoHeight);
        },
        [adjustLayout, props.data.autoHeight],
    );

    const {
        loadedData,
        isLoading,
        isSilentReload,
        isReloadWithNoVeil,
        error,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        loadChartData,
        setLoadingProps,
        setCanBeLoaded,
        isInit,
        dataProps,
        handleRenderChart,
        loadControls,
    } = useLoadingChart({
        dataProvider,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        onChartLoad: handleChartLoad,
        onChartRender: handleRenderChartWidget,
        chartKitRef,
        resolveMetaDataRef,
        resolveWidgetDataRef,
        usedParamsRef,
        innerParamsRef,
        handleChangeCallback,
        widgetDataRef,
        usageType,
        widgetType,
    });

    const {
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        showOverlayWithControlsOnEdit,
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
        ],
    );

    const currentDashTab = useSelector(selectCurrentTab);

    /**
     * get defaults widget params: need to detect relations for external selectors
     */
    const widgetParamsDefaults = React.useMemo(() => {
        const item = currentDashTab?.items.find(
            ({id}: {id: String}) => id === widgetId,
        ) as DashTabItemControl;
        return item.defaults;
    }, [currentDashTab, widgetId]);

    /**
     * debounced call of chartkit reflow
     */
    const debouncedChartReflow = React.useCallback(
        debounce(handleChartkitReflow, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
        [handleChartkitReflow],
    );

    /**
     * get dash widget meta data (new relations feature-flag)
     */
    const getCurrentWidgetResolvedMetaInfo = React.useCallback(
        (loadData: ResolveWidgetControlDataRefArgs | null) => {
            const meta = getWidgetSelectorMeta({
                loadedData: loadData,
                id: widgetId,
                chartId,
                error,
                widgetParamsDefaults,
            });

            if (resolveMetaDataRef.current) {
                resolveMetaDataRef.current(meta);
            }
        },
        [resolveMetaDataRef.current, loadedData, widgetId, chartId, error, widgetParamsDefaults],
    );

    /**
     * get dash widget meta data (current relations)
     */
    const resolveMeta = React.useCallback(
        (loadedData: ResolveWidgetControlDataRefArgs | null) => {
            const meta = getWidgetSelectorMetaOld({
                id: widgetId,
                chartId,
                loadedData,
            });

            if (resolveMetaDataRef.current) {
                resolveMetaDataRef.current(meta);
            }
        },
        [resolveMetaDataRef.current, widgetId, chartId],
    );

    /**
     * get dash widget meta info (used for relations)
     */
    const handleGetWidgetMeta = React.useCallback(
        (argResolve) => {
            resolveMetaDataRef.current = argResolve;
            resolveWidgetDataRef.current = (
                resolvingData: ResolveWidgetControlDataRefArgs | null,
            ) => {
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
            resolveWidgetDataRef.current(loadedData as ResolveWidgetControlDataRefArgs);
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
     * Resize observer adjustLayout
     *
     * For selector if autoHeight prop enabled or when an error occurred
     */
    const isAutoHeightEnabled = Boolean(props.data.autoHeight) || Boolean(error);
    const autoHeightEnabled = isInit && isAutoHeightEnabled;

    const debounceResizeAdjustLayot = React.useCallback(
        debounce(() => {
            adjustLayout(!isAutoHeightEnabled);
        }, WIDGET_RESIZE_DEBOUNCE_TIMEOUT),
        [adjustLayout, isAutoHeightEnabled],
    );

    useResizeObserver({
        onResize: debounceResizeAdjustLayot,
        rootNodeRef,
        enable: autoHeightEnabled,
    });

    /**
     * changed widget content size
     */
    React.useEffect(() => {
        debouncedChartReflow();
    }, [width, height, debouncedChartReflow]);

    /**
     * Load selector if load only visible setting disabled
     */
    React.useEffect(() => {
        if (loadOnlyVisibleCharts === false) {
            setCanBeLoaded(true);
        }
    }, [setCanBeLoaded, loadOnlyVisibleCharts]);

    return {
        loadedData,
        isLoading,
        isSilentReload,
        isReloadWithNoVeil,
        isAutoHeightEnabled,
        error,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        handleUpdate: debounceResizeAdjustLayot,
        handleGetWidgetMeta,
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        loadChartData,
        setLoadingProps,
        showOverlayWithControlsOnEdit,
        dataProps,
        handleRenderChart,
        getControls: loadControls,
    };
};
