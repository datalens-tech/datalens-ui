import {DL} from 'constants/common';

import React from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import type {StringParams} from 'shared';
import {getDataProviderData} from 'ui/libs/DatalensChartkit/components/ChartKitBase/helpers';
import {CHART_RELOAD_EVENT} from 'ui/units/preview/modules/constants/constants';
import {isEmbeddedMode} from 'ui/utils/embedded';

import settings from '../../../libs/DatalensChartkit/modules/settings/settings';
import DebugInfoTool from '../../DashKit/plugins/DebugInfoTool/DebugInfoTool';

import {Content} from './components/Content';
import {
    COMPONENT_CLASSNAME,
    getPreparedConstants,
    removeEmptyNDatasetFieldsProperties,
} from './helpers/helpers';
import {useLoadingChart} from './hooks/useLoadingChart';
import type {
    ChartNoWidgetProps,
    ChartWidgetData,
    ChartWidgetPropsWithContext,
    CurrentRequestState,
    DataProps,
} from './types';

import './Chart.scss';

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
 * Component used only everywhere except dashboard for charts rendering (without extra dash widget logic)
 * @param props
 * @constructor
 */
export const Chart = (props: ChartNoWidgetProps) => {
    const {
        dataProvider,
        forwardedRef,
        noLoader,
        noVeil,
        noControls,
        nonBodyScroll,
        transformLoadedData,
        splitTooltip,
        compactLoader,
        loaderDelay,
        config,
        id: chartId,
        menuType,
        customMenuOptions,
        onChartRender,
        onChartLoad,
        ignoreUsedParams,
        onInnerParamsChanged,
        disableChartLoader,
        actionParamsEnabled,
        isPageHidden,
        autoupdateInterval,
        workbookId,
        forceShowSafeChart,
        paneSplitOrientation,
        widgetDashState,
        onBeforeChartLoad,
    } = props;

    const innerParamsRef = React.useRef<DataProps['params'] | null>(null);
    const prevInnerParams = usePrevious(innerParamsRef?.current);

    const chartkitParams = React.useMemo(
        () => removeEmptyNDatasetFieldsProperties({...props.params}),
        [props.params],
    );

    const initialData: DataProps = React.useMemo(
        () =>
            getDataProviderData({
                id: chartId,
                config,
                params: chartkitParams,
                workbookId,
            }),
        [config, chartId, chartkitParams, workbookId],
    );

    const savedForFetchProps = React.useMemo(() => pick(props, influencingProps), [props]);
    const prevSavedProps = usePrevious(savedForFetchProps);

    const hasChangedOuterProps =
        !prevSavedProps ||
        !isEqual(omit(prevSavedProps, ['params']), omit(pick(props, influencingProps), ['params']));
    const hasChangedOuterParams = !prevSavedProps || !isEqual(prevSavedProps.params, props.params);
    const clearedOuterParams = prevSavedProps
        ? Object.keys(omit(prevSavedProps.params, Object.keys(props?.params || {})))
        : [];

    const hasChangedInnerParamsFromInside = React.useMemo(() => {
        return prevInnerParams && !isEqual(innerParamsRef?.current, prevInnerParams);
    }, [prevInnerParams, innerParamsRef?.current]);

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    const requestId = React.useMemo(
        () => settings.requestIdGenerator(DL.REQUEST_ID_PREFIX),
        [hasChangedOuterProps, hasChangedOuterParams, hasChangedInnerParamsFromInside],
    );

    const rootNodeRef = React.useRef<HTMLDivElement>(props.rootNodeRef?.current || null);
    const widgetDataRef = React.useRef<ChartWidgetData>(null);
    const widgetRenderTimeRef = React.useRef<number | null>(null);

    const [initialParams, setInitialParams] = React.useState<StringParams>({});

    const renderPluginLoader = React.useMemo(() => {
        return disableChartLoader ? () => null : undefined;
    }, [disableChartLoader]);

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

    const {
        loadedData,
        isLoading,
        isSilentReload,
        isReloadWithNoVeil,
        error,
        handleRenderChart,
        handleChange,
        handleRetry,
        handleError,
        loadControls,
        drillDownFilters,
        drillDownLevel,
        yandexMapAPIWaiting,
        dataProps,
        isWidgetMenuDataChanged,
        reloadChart,
        runAction,
    } = useLoadingChart({
        chartKitRef: forwardedRef,
        dataProvider,
        initialData,
        requestId,
        requestCancellationRef,
        innerParamsRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        widgetDataRef,
        widgetRenderTimeRef,
        onChartRender,
        onChartLoad,
        ignoreUsedParams,
        clearedOuterParams,
        onInnerParamsChanged,
        enableActionParams: actionParamsEnabled,
        isPageHidden,
        autoupdateInterval,
        forceShowSafeChart,
        onBeforeChartLoad,
    });

    /**
     * Set initialParams for reset button
     */
    React.useEffect(() => {
        setInitialParams(loadedData?.defaultParams || {});
    }, [loadedData?.defaultParams]);

    const {mods, widgetBodyClassName, hasHiddenClassMod, veil, showLoader, widgetType} =
        React.useMemo(
            () =>
                getPreparedConstants({
                    isLoading,
                    error,
                    loadedData,
                    isReloadWithNoVeil,
                    noLoader,
                    noVeil,
                    isSilentReload,
                    disableChartLoader,
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
                disableChartLoader,
            ],
        );

    // handle reload chart event for iframe preview
    React.useEffect(() => {
        if (isEmbeddedMode()) {
            const handleMessageEvent = (event: MessageEvent) => {
                if (event.data.type === CHART_RELOAD_EVENT) {
                    reloadChart();
                }
            };

            window.addEventListener('message', handleMessageEvent);

            return () => {
                window.removeEventListener('message', handleMessageEvent);
            };
        }

        return undefined;
    }, [reloadChart]);

    return (
        <div ref={rootNodeRef} className={`${b(mods)}`}>
            <DebugInfoTool data={[{label: 'chartId', value: chartId || ''}]} />
            <Content
                initialParams={initialParams}
                dataProps={dataProps}
                dataProvider={dataProvider}
                showLoader={showLoader}
                compactLoader={compactLoader}
                veil={veil}
                loaderDelay={loaderDelay}
                widgetBodyClassName={widgetBodyClassName}
                hasHiddenClassMod={hasHiddenClassMod}
                chartId={chartId}
                noControls={noControls}
                transformLoadedData={transformLoadedData}
                splitTooltip={splitTooltip}
                nonBodyScroll={nonBodyScroll}
                requestId={requestId}
                error={error}
                onRender={handleRenderChart}
                onChange={handleChange}
                onRetry={handleRetry}
                onError={handleError}
                loadedData={loadedData}
                forwardedRef={forwardedRef}
                getControls={loadControls}
                runAction={runAction}
                drillDownFilters={drillDownFilters}
                drillDownLevel={drillDownLevel}
                widgetType={widgetType}
                menuType={menuType}
                customMenuOptions={customMenuOptions}
                widgetDataRef={widgetDataRef}
                widgetRenderTimeRef={widgetRenderTimeRef}
                yandexMapAPIWaiting={yandexMapAPIWaiting}
                isWidgetMenuDataChanged={isWidgetMenuDataChanged}
                renderPluginLoader={renderPluginLoader}
                paneSplitOrientation={paneSplitOrientation}
                widgetDashState={widgetDashState}
                rootNodeRef={rootNodeRef}
            />
        </div>
    );
};
