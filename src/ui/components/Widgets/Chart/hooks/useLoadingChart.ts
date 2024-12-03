import React from 'react';

import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import type {ItemStateAndParamsChangeOptions} from '@gravity-ui/dashkit';
import {
    pickActionParamsFromParams,
    pickExceptActionParamsFromParams,
} from '@gravity-ui/dashkit/helpers';
import {useMountedState, usePrevious} from 'hooks';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import type {DashChartRequestContext, StringParams} from 'shared';
import {DashTabItemControlSourceType, SHARED_URL_OPTIONS} from 'shared';
import {isEmbeddedMode} from 'ui/utils/embedded';

import type {ChartKit} from '../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {START_PAGE} from '../../../../libs/DatalensChartkit/ChartKit/components/Widget/components/Table/Paginator/Paginator';
import type {
    ChartKitWrapperLoadError,
    ChartKitWrapperLoadStatusUnknown,
    ChartKitWrapperLoadSuccess,
} from '../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {ChartsProps} from '../../../../libs/DatalensChartkit/modules/data-provider/charts';
import DatalensChartkitCustomError, {
    ERROR_CODE,
    formatError,
} from '../../../../libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {CombinedError, OnChangeData} from '../../../../libs/DatalensChartkit/types';
import {isAllParamsEmpty} from '../helpers/helpers';
import {getInitialState, reducer} from '../store/reducer';
import {
    WIDGET_CHART_RESET_CHANGED_PARAMS,
    WIDGET_CHART_SET_DATA_PARAMS,
    WIDGET_CHART_SET_LOADED_DATA,
    WIDGET_CHART_SET_LOADING,
    WIDGET_CHART_SET_LOAD_SETTINGS,
    WIDGET_CHART_SET_WIDGET_ERROR,
    WIDGET_CHART_UPDATE_DATA_PARAMS,
} from '../store/types';
import type {
    ChartContentProps,
    ChartNoWidgetProps,
    ChartSelectorWithRefProps,
    ChartWithProviderProps,
    ChartWrapperWithRefProps,
    CurrentRequestState,
    CurrentRequestStateItem,
    DataProps,
    OnLoadChartkitData,
    ResolveMetaDataRef,
    ResolveWidgetControlDataRef,
    ResolveWidgetControlDataRefArgs,
    ResolveWidgetDataRef,
    WidgetDataRef,
} from '../types';
import {cleanUpConflictingParameters} from '../utils';

import {useIntersectionObserver} from './useIntersectionObserver';
import {useMemoCallback} from './useMemoCallback';

export type LoadingChartHookProps = {
    dataProvider: ChartWithProviderProps['dataProvider'];
    dataProviderContextGetter?: () => DashChartRequestContext;
    initialData: DataProps;
    requestId: string;
    requestCancellationRef: React.MutableRefObject<CurrentRequestState>;
    rootNodeRef: React.RefObject<HTMLDivElement>;
    onChartRender?: ChartNoWidgetProps['onChartRender'];
    onChartLoad?: ChartNoWidgetProps['onChartLoad'];
    hasChangedOuterProps: boolean;
    hasChangedOuterParams: boolean;
    hasChartTabChanged?: boolean;
    chartKitRef: React.RefObject<ChartKit> | React.MutableRefObject<ChartKit | undefined>;
    resolveMetaDataRef?: React.MutableRefObject<ResolveMetaDataRef | undefined>;
    resolveWidgetDataRef?: React.MutableRefObject<
        ResolveWidgetDataRef | ResolveWidgetControlDataRef | undefined
    >;
    usedParamsRef?: React.MutableRefObject<DataProps['params'] | null>;
    innerParamsRef?: React.MutableRefObject<DataProps['params'] | null>;
    handleChangeCallback?: (arg: OnChangeData) => void;
    widgetDataRef?: WidgetDataRef;
    widgetRenderTimeRef?: ChartContentProps['widgetRenderTimeRef'];
    usageType?: ChartWrapperWithRefProps['usageType'];
    ignoreUsedParams?: ChartNoWidgetProps['ignoreUsedParams'];
    clearedOuterParams?: string[];
    onInnerParamsChanged?: (params: StringParams) => void;
    hasChangedActionParams?: boolean;
    enableActionParams?: boolean;
    widgetType?: ChartSelectorWithRefProps['widgetType'];
    isPageHidden?: boolean;
    autoupdateInterval?: number;
    forceShowSafeChart?: boolean;
    onBeforeChartLoad?: () => Promise<void>;
};

type AutoupdateDataType = {
    isPageHidden?: boolean;
    reloadTimeout?: NodeJS.Timeout;
    lastReloadAt?: number;
};

const EXCLUDE_CHART_WITH_AXIS_FOR_MENU_RERENDER = ['map'];

type LoadingStateType = {
    canBeLoaded: boolean;
    isInit: boolean;
};

const loadingStateReducer = (state: LoadingStateType, newState: Partial<LoadingStateType>) => {
    const hasChanges = Object.entries(newState).find(
        ([key, value]) => state[key as keyof LoadingStateType] !== value,
    );

    if (hasChanges) {
        return {...state, ...newState};
    }

    return state;
};

export const useLoadingChart = (props: LoadingChartHookProps) => {
    const {
        dataProvider,
        dataProviderContextGetter,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        hasChangedActionParams,
        onChartRender,
        onChartLoad,
        chartKitRef,
        resolveMetaDataRef,
        resolveWidgetDataRef,
        usedParamsRef,
        innerParamsRef,
        widgetDataRef,
        widgetRenderTimeRef,
        handleChangeCallback,
        ignoreUsedParams,
        clearedOuterParams,
        onInnerParamsChanged,
        enableActionParams,
        widgetType,
        autoupdateInterval,
        isPageHidden,
        forceShowSafeChart,
        onBeforeChartLoad,
    } = props;

    const [{isInit, canBeLoaded}, setLoadingState] = React.useReducer(loadingStateReducer, {
        isInit: false,
        canBeLoaded: false,
    });

    const isMounted = useMountedState([]);

    const setIsInit = React.useCallback((value: boolean) => setLoadingState({isInit: value}), []);
    const setCanBeLoaded = React.useCallback(
        (value: boolean) => setLoadingState({canBeLoaded: value}),
        [],
    );

    const [yandexMapAPIWaiting, setYandexMapAPIWaiting] =
        React.useState<ChartContentProps['yandexMapAPIWaiting']>();

    const [widgetMenuData, setWidgetMenuData] = React.useState<{
        xAxis: Highcharts.Chart['xAxis'];
    } | null>(null);

    const [isWidgetMenuDataChanged, setIsWidgetMenuDataChanged] = React.useState<boolean>(false);

    const prevWidgetMenuData = usePrevious(widgetMenuData);
    const prevInnerParamsRefCurrent = usePrevious(innerParamsRef?.current);

    const [
        {
            changedParams,
            usedParams,
            isLoading,
            isSilentReload,
            isReloadWithNoVeil,
            loadedData,
            error,
        },
        dispatch,
    ] = React.useReducer(reducer, getInitialState());

    const [renderedCallbackCalledOnce, setRenderedCallbackCalledOnce] = React.useState(false);
    const [changedInnerFlag, setChangedInnerFlag] = React.useState<boolean>(false);

    // need to track the current values in setTimeout callback of reloadChart
    const autoupdateDataRef = React.useRef<AutoupdateDataType>({
        isPageHidden: false,
        reloadTimeout: undefined,
        lastReloadAt: undefined,
    });
    autoupdateDataRef.current.isPageHidden = isPageHidden;

    const currentChangeParamsRef = React.useRef<ChartsProps['params'] | null>(null);

    const loadedDrillDownLevel = React.useMemo(() => {
        let level = Array.isArray(loadedData?.params.drillDownLevel)
            ? loadedData?.params.drillDownLevel[0]
            : loadedData?.params.drillDownLevel;
        level = String(level)?.trim() || '0';
        return Number(level) || 0;
    }, [loadedData?.params.drillDownLevel]);

    const [currentDrillDownLevel, setCurrentDrillDownLevel] = React.useState(loadedDrillDownLevel);

    const drillDownFilters = React.useMemo(
        () => (loadedData?.params.drillDownFilters || []) as string[],
        [loadedData?.params.drillDownFilters],
    );

    const requestDataProps: DataProps = React.useMemo(() => {
        let res = {...initialData};
        let params = {...initialData.params};
        if (!ignoreUsedParams && usedParams) {
            params = pick(initialData.params || {}, Object.keys(usedParams));
        }
        let localParams = hasChartTabChanged ? {} : changedParams || {};

        if (hasChangedActionParams && changedParams) {
            const localActionParams = pickActionParamsFromParams(changedParams, true);
            const newLocalActionParams: StringParams = {};

            for (const [key, val] of Object.entries(localActionParams)) {
                if (key in params) {
                    newLocalActionParams[key] = val as string | string[];
                }
            }

            const localOnlyParams = pickExceptActionParamsFromParams(changedParams);
            localParams = {...localOnlyParams, ...newLocalActionParams};
        }
        currentChangeParamsRef.current = localParams;

        if (hasChangedOuterProps || hasChangedOuterParams) {
            const filteredLocalParams = clearedOuterParams?.length
                ? omit(localParams, clearedOuterParams)
                : localParams;

            // when clear params of widget from outer
            // ex cleared actionParams from other chart cause empty params in current
            // or params contains params without local
            const newParams =
                hasChangedOuterParams && isEmpty(params)
                    ? {
                          ...params,
                      }
                    : {
                          ...filteredLocalParams,
                          ...params,
                      };
            res = {
                ...res,
                params: newParams,
            };
        } else {
            res = {
                ...res,
                params: {
                    ...params,
                    ...localParams,
                },
            };
        }
        if (forceShowSafeChart) {
            res = {
                ...res,
                params: {
                    ...res.params,
                    [SHARED_URL_OPTIONS.SAFE_CHART]: '1',
                },
            };
        }
        return res;
    }, [
        ignoreUsedParams,
        hasChangedActionParams,
        changedParams,
        initialData,
        usedParams,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        clearedOuterParams,
        currentChangeParamsRef,
        forceShowSafeChart,
    ]);

    const handleError = React.useCallback(
        ({error: errorMsg}: {error: CombinedError}) => {
            const errorRequestId =
                ('debug' in errorMsg && errorMsg.debug?.requestId) || loadedData?.requestId;
            const traceId = ('debug' in errorMsg && errorMsg.debug?.traceId) || loadedData?.traceId;

            const formattedError = formatError({
                error: errorMsg,
                requestId: errorRequestId,
                traceId,
            });

            dispatch({
                type: WIDGET_CHART_SET_WIDGET_ERROR,
                payload: {
                    isLoading: false,
                    isSilentReload: false,
                    isReloadWithNoVeil: false,
                    error: formattedError,
                },
            });

            onChartRender?.(
                {
                    status: 'error',
                    data: {
                        error: errorMsg,
                        loadedData,
                    },
                } as ChartKitWrapperLoadError,
                dataProvider,
            );
        },
        [loadedData, dispatch, onChartRender, dataProvider],
    );

    /**
     * fires before starting new request,
     * setting canceling status for any loading requests and cancel them via dataProvider
     */
    const cancelAllLoadingRequests = React.useCallback(
        (isComponentMounted: boolean) => {
            for (const [key, requestStatusData] of Object.entries(
                requestCancellationRef.current || {},
            )) {
                const needToCancelReq =
                    requestStatusData.status === 'loading' ||
                    (requestStatusData.status === 'unset' && requestId !== key) ||
                    !isComponentMounted;
                if (needToCancelReq && requestStatusData.requestCancellation) {
                    requestStatusData.status = 'canceled';
                    dataProvider.cancelRequests(requestStatusData.requestCancellation);
                }
            }
        },
        [requestCancellationRef, dataProvider, requestId],
    );

    /**
     * loading widget chart data
     */
    // eslint-disable-next-line complexity
    const loadChartData = React.useCallback(async () => {
        if (!requestDataProps) {
            return;
        }

        cleanUpConflictingParameters({
            prev: prevInnerParamsRefCurrent,
            current: requestDataProps.params,
        });

        // need to prevent double request before get response
        if (changedInnerFlag) {
            setChangedInnerFlag(false);
        }
        dispatch({type: WIDGET_CHART_SET_LOADING, payload: true});

        try {
            // for correct check of changed params for widgets
            if (innerParamsRef) {
                innerParamsRef.current = requestDataProps.params;
            }
            // for reset inner changed params if outer changed
            if (hasChangedOuterParams) {
                dispatch({
                    type: clearedOuterParams?.length
                        ? WIDGET_CHART_SET_DATA_PARAMS
                        : WIDGET_CHART_UPDATE_DATA_PARAMS,
                    payload: requestDataProps.params,
                });
            }
            if (hasChartTabChanged || hasChangedActionParams) {
                const newChangedParams =
                    (hasChangedActionParams && currentChangeParamsRef?.current) || null;
                dispatch({type: WIDGET_CHART_RESET_CHANGED_PARAMS, payload: newChangedParams});
            }

            let widgetConfig;
            if (enableActionParams) {
                // sending additional config for enabled filtering charts in section actionParams
                // (will be set in dash relation dialog later), if undefined - means that using full fields list
                widgetConfig = {
                    actionParams: {
                        enable: true,
                    },
                };
            }

            const getWidgetProps =
                widgetType === DashTabItemControlSourceType.External
                    ? {
                          ...requestDataProps,
                          widgetType: DashTabItemControlSourceType.External,
                          widgetConfig,
                      }
                    : {...requestDataProps, widgetConfig};

            /**
             * can't use debounced getWidget on dash because of widget priority setting
             * fix in CHARTS-7043
             */
            const getWidget = dataProvider.getWidget.bind(dataProvider);
            const loadedWidgetData = await getWidget({
                props: getWidgetProps,
                requestId,
                requestCancellation:
                    requestCancellationRef.current[requestId]?.requestCancellation ||
                    dataProvider.getRequestCancellation(),
                ...(dataProviderContextGetter ? {contextHeaders: dataProviderContextGetter()} : {}),
            });

            const isCanceled = requestCancellationRef.current?.[requestId]?.status === 'canceled';

            if (isCanceled || loadedWidgetData === undefined || !rootNodeRef.current) {
                if (requestCancellationRef.current[requestId]) {
                    delete requestCancellationRef.current[requestId];
                }
                return;
            }

            if (requestCancellationRef.current?.[requestId]?.status) {
                requestCancellationRef.current[requestId].status = 'loaded';
            }

            if (usedParamsRef) {
                usedParamsRef.current = (loadedWidgetData?.usedParams || null) as
                    | DataProps['params']
                    | null;
            }
            if (changedInnerFlag) {
                setChangedInnerFlag(false);
            }

            resolveMetaDataRef?.current?.(
                resolveWidgetDataRef?.current?.(
                    loadedWidgetData as ResolveWidgetControlDataRefArgs,
                ),
            );

            await onBeforeChartLoad?.();

            // order is important for updateHighchartsConfig from editor
            onChartLoad?.({
                status: 'success',
                data: {
                    loadedData: loadedWidgetData,
                },
            } as ChartKitWrapperLoadSuccess);

            // order is important for updateHighchartsConfig from editor
            dispatch({type: WIDGET_CHART_SET_LOADED_DATA, payload: loadedWidgetData});
        } catch (err) {
            if (requestCancellationRef.current?.[requestId]?.status) {
                requestCancellationRef.current[requestId].status = 'error';
            }

            handleError({
                error: DatalensChartkitCustomError.wrap(err, {
                    code: err.code || ERROR_CODE.DATA_PROVIDER_ERROR,
                }),
            });

            onChartLoad?.({
                status: 'error',
                data: {
                    error: DatalensChartkitCustomError.wrap(err, {
                        code: err.code || ERROR_CODE.DATA_PROVIDER_ERROR,
                    }),
                },
            } as ChartKitWrapperLoadError);
            resolveMetaDataRef?.current?.(resolveWidgetDataRef?.current?.(null));
        }
    }, [
        dataProviderContextGetter,
        dispatch,
        changedInnerFlag,
        usedParamsRef,
        innerParamsRef,
        handleError,
        requestDataProps,
        requestId,
        requestCancellationRef,
        dataProvider,
        resolveMetaDataRef,
        resolveWidgetDataRef,
        hasChangedOuterParams,
        onChartLoad,
        clearedOuterParams,
        widgetType,
        rootNodeRef,
        enableActionParams,
    ]);

    /**
     * reload chart by timer when the _autoupdate param is passed
     */
    const reloadChart = React.useCallback(() => {
        const autoupdateIntervalMs = Number(autoupdateInterval) * 1000;
        if (autoupdateIntervalMs) {
            const timeSinceLastReload =
                new Date().getTime() - (autoupdateDataRef.current.lastReloadAt || 0);
            const reloadIntervalRemains = autoupdateIntervalMs - timeSinceLastReload;

            if (
                (!autoupdateDataRef.current.isPageHidden || isEmbeddedMode()) &&
                reloadIntervalRemains <= 0 &&
                autoupdateDataRef.current.reloadTimeout
            ) {
                autoupdateDataRef.current.lastReloadAt = new Date().getTime();
                loadChartData();
            }

            autoupdateDataRef.current.reloadTimeout = setTimeout(
                () => reloadChart(),
                autoupdateIntervalMs,
            );
        }
    }, [loadChartData, autoupdateInterval]);

    // need update timeout if it's first render with autoupdateInterval = 0, or if visibility of page is changed
    // reloadChart is excluded from deps intentionally to reduce the number of reloadChart calls
    React.useEffect(() => {
        clearTimeout(autoupdateDataRef.current.reloadTimeout);
        if (!isPageHidden) {
            reloadChart();
        }
    }, [isPageHidden, autoupdateInterval]);

    /**
     * check if current widget is in viewport
     * turn on loading widget data flag if it's in viewport
     */
    const intersectionChange = React.useCallback(
        (isVisible: boolean) => {
            if (isVisible) {
                setLoadingState({
                    canBeLoaded: true,
                    isInit: true,
                });
                loadChartData();
            }
        },
        [loadChartData],
    );

    useIntersectionObserver({
        nodeRef: rootNodeRef,
        callback: intersectionChange,
        enable: !isInit && !canBeLoaded,
    });

    /**
     * cancel active requests when component is unmounted (changing dash tab, switching to another page)
     */
    React.useEffect(() => {
        return () => {
            const isComponentMounted = isMounted();
            if (!isComponentMounted) {
                cancelAllLoadingRequests(isComponentMounted);
            }
        };
    }, [isMounted, cancelAllLoadingRequests]);

    /**
     * force initializing chart loading data, when widget became visible,
     * loading only visible on screen charts
     */
    React.useEffect(() => {
        if (!canBeLoaded || isInit) {
            return;
        }

        setIsInit(true);
        loadChartData();
    }, [canBeLoaded, isInit, loadChartData]);

    /**
     * loading chart data if params, props or chart tabs changed
     */
    React.useEffect(() => {
        const changedOuter = hasChangedOuterProps || hasChangedOuterParams || hasChartTabChanged;
        const hasChanged = changedOuter || changedInnerFlag;

        if (!hasChanged || !isInit) {
            return;
        }

        cancelAllLoadingRequests(true);

        dispatch({type: WIDGET_CHART_SET_LOADING, payload: true});

        requestCancellationRef.current[requestId] = {
            status: 'loading',
            requestCancellation:
                requestCancellationRef.current[requestId]?.requestCancellation ||
                dataProvider.getRequestCancellation(),
        } as CurrentRequestStateItem;

        loadChartData();
    }, [
        requestId,
        requestCancellationRef,
        cancelAllLoadingRequests,
        loadChartData,
        changedInnerFlag,
        isInit,
        hasChangedOuterProps,
        hasChangedOuterParams,
        hasChartTabChanged,
        dispatch,
    ]);

    /**
     * Is needed for rerender chart menu after render once
     */
    React.useEffect(() => {
        const isChanged = !isEqual(widgetMenuData, prevWidgetMenuData);
        setIsWidgetMenuDataChanged(isChanged);
    }, [widgetMenuData, prevWidgetMenuData]);

    /**
     * triggers from chartkit instance after each it's render
     */
    const handleRenderChart = React.useCallback(
        (renderedData: OnLoadChartkitData) => {
            // If render callback called while no loaded data we do not set any data to prevent unnecessary
            // rerenders and side effects
            if (!loadedData) {
                return;
            }

            if (!renderedData) {
                // If no data in onRender callback we do not set any data to prevent not needed rerenders,
                // but we need to adjust layout for widget, and that causes extra re-render.
                // To prevent cycling re-render on adjust we call it once
                if (!renderedCallbackCalledOnce) {
                    onChartRender?.(
                        {
                            status: null,
                        } as ChartKitWrapperLoadStatusUnknown,
                        dataProvider,
                    );
                    setRenderedCallbackCalledOnce(true);
                }
                return;
            }

            if (widgetDataRef) {
                // updating ref data on each render callback
                widgetDataRef.current = renderedData.widget || null;
            }

            const needSetMenuConfigData =
                renderedData.widget &&
                widgetDataRef?.current &&
                'xAxis' in renderedData.widget &&
                !EXCLUDE_CHART_WITH_AXIS_FOR_MENU_RERENDER.includes(loadedData.type);

            // set for rerender Comment menu (only for HighCharts widgets with available Comments)
            if (needSetMenuConfigData) {
                setWidgetMenuData({
                    xAxis: (widgetDataRef?.current as Highcharts.Chart).xAxis || null,
                });
            }

            if (widgetRenderTimeRef) {
                widgetRenderTimeRef.current = renderedData.widgetRendering || null;
            }

            setYandexMapAPIWaiting(renderedData?.yandexMapAPIWaiting);

            if (typeof loadedData?.uiSandboxOptions?.totalTimeLimit !== 'undefined') {
                delete loadedData.uiSandboxOptions.totalTimeLimit;
            }

            onChartRender?.(
                {
                    status: 'success',
                    data: {
                        widgetData: renderedData.widget || null,
                        loadedData, // for ChartStats
                    },
                } as ChartKitWrapperLoadSuccess,
                dataProvider,
            );
        },
        [
            loadedData,
            widgetRenderTimeRef,
            widgetDataRef,
            renderedCallbackCalledOnce,
            onChartRender,
            dataProvider,
        ],
    );

    /**
     * call chartkit reflow
     * triggers by public method
     */
    const handleChartkitReflow = React.useCallback(() => {
        chartKitRef.current?.reflow?.();
    }, [chartKitRef]);

    /**
     * set new loader and veil settings for loading
     * triggers by autoreload dash or force chart reload (by public method)
     */
    const setLoadingProps = React.useCallback(
        (arg: {silentLoading?: boolean; noVeil?: boolean}) => {
            if (!arg) {
                return;
            }
            dispatch({
                type: WIDGET_CHART_SET_LOAD_SETTINGS,
                payload: {
                    isSilentReload: Boolean(arg.silentLoading),
                    isReloadWithNoVeil: Boolean(arg.noVeil),
                },
            });
        },
        [dispatch],
    );

    /**
     * loading chart data if available
     */
    const loadChart = React.useCallback(() => {
        if (!canBeLoaded || !isInit) {
            return;
        }

        loadChartData();
    }, [canBeLoaded, isInit, loadChartData]);

    /**
     * loading chart controls
     * triggers by public method
     */
    const loadControls = React.useCallback(
        async (params: StringParams) => {
            if (!dataProvider.getControls && typeof dataProvider.getControls !== 'function') {
                console.warn('ChartKit: getControls called but not defined in dataProvider');
                return null;
            }
            try {
                const loadedControlsData = await dataProvider.getControls({
                    props: {...initialData, params},
                    requestId,
                    requestCancellation:
                        requestCancellationRef.current[requestId]?.requestCancellation ||
                        dataProvider.getRequestCancellation(),
                    ...(dataProviderContextGetter
                        ? {contextHeaders: dataProviderContextGetter()}
                        : {}),
                });
                if (!rootNodeRef.current) {
                    return null;
                }
                return loadedControlsData;
            } catch (err) {
                handleError({
                    error: DatalensChartkitCustomError.wrap(err, {
                        code: err.code || ERROR_CODE.DATA_PROVIDER_ERROR,
                    }),
                });
            }
            return null;
        },
        [dataProvider, initialData, requestId, requestCancellationRef, rootNodeRef, handleError],
    );

    const handleChange = useMemoCallback(
        // eslint-disable-next-line complexity
        (
            changedData: OnChangeData,
            _state: {forceUpdate: boolean},
            callExternalOnChange?: boolean,
            callChangeByClick?: boolean,
        ) => {
            /**
             * triggers on change:
             * - comments visibility
             * - hierarchy level
             * - pagination
             * - other by params
             */
            if (changedData.type === 'PARAMS_CHANGED') {
                let newParams = null;
                let additionalParams = {};
                if ('params' in changedData.data) {
                    // reset _page param on hierarchy level changed
                    const newDrillDownLevel = Number(changedData.data.params.drillDownLevel);
                    if (
                        !isNaN(newDrillDownLevel) &&
                        (currentDrillDownLevel || newDrillDownLevel) &&
                        currentDrillDownLevel !== newDrillDownLevel
                    ) {
                        additionalParams = {
                            _page: String(START_PAGE),
                        };
                    }
                    newParams = {...changedData.data.params, ...additionalParams};
                    if (!enableActionParams) {
                        newParams = pickExceptActionParamsFromParams(newParams);
                    }
                }

                if ((newParams as DataProps['params'])?.drillDownLevel !== undefined) {
                    setCurrentDrillDownLevel(
                        Number((newParams as DataProps['params'])?.drillDownLevel || 0),
                    );
                }

                const needUpdateChartParams =
                    !isEqual(initialData.params, newParams) || callChangeByClick;

                // if prev loading chart params contained actionParams
                // & newParams contain only empty values,
                // we need to clean it
                const needClearParamsQueue =
                    !isAllParamsEmpty(
                        pickActionParamsFromParams(prevInnerParamsRefCurrent || undefined),
                    ) && isAllParamsEmpty(newParams);

                if (newParams && needUpdateChartParams) {
                    const actionName =
                        isEmpty(newParams) && callChangeByClick
                            ? WIDGET_CHART_RESET_CHANGED_PARAMS
                            : WIDGET_CHART_UPDATE_DATA_PARAMS;
                    dispatch({
                        type: actionName,
                        payload: newParams,
                    });

                    setChangedInnerFlag(true);
                }

                if (newParams && typeof onInnerParamsChanged === 'function') {
                    onInnerParamsChanged(newParams);
                }

                // call only for widgets with callback (only on dash)
                if (
                    callExternalOnChange &&
                    typeof handleChangeCallback === 'function' &&
                    newParams
                ) {
                    const options: ItemStateAndParamsChangeOptions | undefined =
                        needClearParamsQueue
                            ? {
                                  action: 'removeItem',
                              }
                            : undefined;
                    handleChangeCallback({
                        type: 'PARAMS_CHANGED',
                        data: {
                            params: newParams,
                        },
                        options,
                    });
                }
            } else if (callExternalOnChange && typeof handleChangeCallback === 'function') {
                // call only for widgets with callback (only on dash)
                const res = {...changedData};
                if (enableActionParams && 'params' in res.data) {
                    res.data.params = pickExceptActionParamsFromParams(
                        res.data.params as StringParams,
                    );
                }
                handleChangeCallback(res);
            }
        },
        [],
    );

    const handleRetry = React.useCallback(
        (data?: OnChangeData['data']) => {
            if (data) {
                if ('params' in data) {
                    handleChange({type: 'PARAMS_CHANGED', data}, {forceUpdate: true}, false);
                }
            } else {
                loadChartData();
            }
        },
        [loadChartData, handleChange],
    );

    const runAction = React.useCallback(
        (params: StringParams) => {
            return dataProvider.runAction({
                props: {...initialData, params},
                requestId,
                ...(dataProviderContextGetter ? {contextHeaders: dataProviderContextGetter()} : {}),
            });
        },
        [dataProvider, initialData, requestId, dataProviderContextGetter],
    );

    return {
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
        loadChartData: loadChart,
        reloadChart: loadChartData,
        setLoadingProps,
        loadControls,
        drillDownFilters,
        drillDownLevel: currentDrillDownLevel,
        setCurrentDrillDownLevel,
        yandexMapAPIWaiting,
        setCanBeLoaded,
        isInit,
        dataProps: requestDataProps,
        isWidgetMenuDataChanged,
        runAction,
    };
};
