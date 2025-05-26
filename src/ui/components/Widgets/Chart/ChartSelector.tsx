import React from 'react';

import {pickExceptActionParamsFromParams} from '@gravity-ui/dashkit/helpers';
import {Loader as CommonLoader} from '@gravity-ui/uikit';
import type {AxiosResponse} from 'axios';
import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {useSelector} from 'react-redux';
import type {StringParams} from 'shared';
import {DashTabItemControlSourceType, Feature} from 'shared';
import {DL} from 'ui/constants/common';
import {useChangedValue} from 'ui/hooks/useChangedProp';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {ChartKit} from '../../../libs/DatalensChartkit/ChartKit/ChartKit';
import type {ChartInitialParams} from '../../../libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import {DatalensChartkitContent} from '../../../libs/DatalensChartkit/components/ChartKitBase/components/Chart/Chart';
import Loader from '../../../libs/DatalensChartkit/components/ChartKitBase/components/Loader/Loader';
import {getDataProviderData} from '../../../libs/DatalensChartkit/components/ChartKitBase/helpers';
import type {ResponseError} from '../../../libs/DatalensChartkit/modules/data-provider/charts';
import ExtensionsManager from '../../../libs/DatalensChartkit/modules/extensions-manager/extensions-manager';
import settings from '../../../libs/DatalensChartkit/modules/settings/settings';
import type {ControlsOnlyWidget} from '../../../libs/DatalensChartkit/types';
import {selectSkipReload} from '../../../units/dash/store/selectors/dashTypedSelectors';
import DebugInfoTool from '../../DashKit/plugins/DebugInfoTool/DebugInfoTool';

import {useChartActions} from './helpers/chart-actions';
import {COMPONENT_CLASSNAME, removeEmptyNDatasetFieldsProperties} from './helpers/helpers';
import {useLoadingChartSelector} from './hooks/useLoadingChartSelector';
import type {
    ChartControlsType,
    ChartSelectorWidgetProps,
    ChartSelectorWithWrapRefProps,
    ChartWidgetData,
    ChartWidgetPropsWithContext,
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
const Control = ExtensionsManager.getWithWrapper(
    'control',
) as unknown as React.ComponentType<ChartControlsType>;

/**
 * Component used only on dashboard for chartEditor selectors rendering with extra dash widget logic
 * @param props
 * @constructor
 */
export const ChartSelector = (props: ChartSelectorWidgetProps) => {
    const {
        dataProvider,
        forwardedRef,
        nonBodyScroll,
        loaderDelay,
        id: chartId,
        config,
        widgetId,
        workbookId,
    } = props;

    const skipReload = useSelector(selectSkipReload);

    const chartkitParams = React.useMemo(() => {
        let res = removeEmptyNDatasetFieldsProperties(props.params);
        res = pickExceptActionParamsFromParams(res);
        return res;
    }, [props.params]);

    const prevCurrentDefaults = usePrevious(props.defaults);
    const hasCurrentDefaultsChanged =
        prevCurrentDefaults && !isEqual(props.defaults, prevCurrentDefaults);

    const initialData: DataProps = React.useMemo(
        () =>
            getDataProviderData({
                id: chartId,
                config,
                params: chartkitParams,
                workbookId,
            }),
        [chartId, chartkitParams, config, workbookId],
    );

    const usedParamsRef = React.useRef<DataProps['params'] | null>(null);
    const innerParamsRef = React.useRef<DataProps['params'] | null>(null);

    const hasInfluencingPropsChanged = useChangedValue(
        omit(pick(props, influencingProps), 'params'),
    );
    const hasParamsChanged = useChangedValue(props.params);
    const hasInnerParamsChanged = useChangedValue(innerParamsRef?.current);
    const hasChartIdChanged = useChangedValue(chartId);

    const hasChangedOuterProps = hasInfluencingPropsChanged || hasChartIdChanged;

    const hasChangedOuterParams = React.useMemo(() => {
        let changedParams = hasParamsChanged;

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
        if (changedParams && innerParamsRef?.current) {
            const innerFullParams = innerParamsRef?.current;
            const outerFullParams = props.params;

            isOuterAndInnerParamsEqual = isEqual(innerFullParams, outerFullParams);

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

        if (isOuterAndInnerParamsEqual) {
            changedParams = false;
        }

        return changedParams;
    }, [hasParamsChanged, props.params, usedParamsRef, innerParamsRef]);

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    const requestId = React.useMemo(
        () => settings.requestIdGenerator(DL.REQUEST_ID_PREFIX),
        [hasChangedOuterParams, hasChangedOuterProps, hasInnerParamsChanged],
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
    const chartKitRef = React.useRef<ChartKit>(); // ref is forwarded to ChartKit
    const widgetDataRef = React.useRef<ChartWidgetData>(null);

    const [initialParams, setInitialParams] = React.useState<StringParams>(
        props.initialParams?.params || {},
    );

    const controlInitialParams = {
        params: initialParams || {},
    } as ChartInitialParams;

    const widgetType = DashTabItemControlSourceType.External;

    const {
        loadedData,
        error,
        handleRenderChart,
        mods,
        widgetBodyClassName,
        hasHiddenClassMod,
        veil,
        showLoader,
        handleGetWidgetMeta,
        handleChartkitReflow,
        handleChange,
        handleError,
        handleRetry,
        handleUpdate,
        loadChartData,
        setLoadingProps,
        getControls,
        isAutoHeightEnabled,
        runAction,
    } = useLoadingChartSelector({
        ...props,
        chartKitRef,
        rootNodeRef,
        initialData,
        requestId,
        requestCancellationRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        widgetId,
        usedParamsRef,
        innerParamsRef,
        widgetDataRef,
        chartId,
        widgetType,
    });

    const {onAction} = useChartActions({
        onChange: handleChange,
    });

    const hasControl = Boolean((loadedData as ControlsOnlyWidget)?.controls?.controls?.length);

    /**
     * Set initialParams on load chart defaults or when selector default params changed
     */
    React.useEffect(() => {
        if (!hasCurrentDefaultsChanged && !loadedData) {
            return;
        }

        setInitialParams({...loadedData?.defaultParams, ...props.defaults});
    }, [hasCurrentDefaultsChanged, props.defaults, loadedData?.defaultParams]);

    React.useImperativeHandle<ChartSelectorWithWrapRefProps, ChartSelectorWithWrapRefProps>(
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

    const hasError = Boolean(
        error || (loadedData as unknown as AxiosResponse<ResponseError>)?.data?.error,
    );

    const showFloatControls = isEnabledFeature(Feature.DashFloatControls);

    return (
        <div
            ref={rootNodeRef}
            className={`${b({
                ...mods,
                autoheight: isAutoHeightEnabled,
            })}`}
            data-qa="chart-widget-selectors"
        >
            <DebugInfoTool
                data={[
                    {label: 'widgetId', value: widgetId},
                    {label: 'chartId', value: chartId},
                ]}
            />
            <div className={b('container', {[String(widgetType)]: Boolean(widgetType)})}>
                {!showFloatControls && (
                    <Loader visible={showLoader} veil={veil} delay={loaderDelay} />
                )}
                {showFloatControls && !hasError && !hasControl && showLoader && (
                    <div className={b('loader')}>
                        <CommonLoader size="s" />
                    </div>
                )}
                <div
                    className={b(
                        'body',
                        {hidden: hasHiddenClassMod, [String(widgetType)]: Boolean(widgetType)},
                        widgetBodyClassName,
                    )}
                    data-qa={chartId ? `chartkit-body-entry-${chartId}` : null}
                >
                    {Boolean(!hasError && hasControl && getControls) && (
                        <Control
                            id={chartId}
                            data={loadedData}
                            onLoad={handleRenderChart}
                            onError={handleError}
                            onChange={handleChange}
                            onUpdate={handleUpdate}
                            getControls={getControls}
                            nonBodyScroll={nonBodyScroll}
                            initialParams={controlInitialParams}
                            runAction={runAction}
                            onAction={onAction}
                        />
                    )}
                    {/* DatalensChartkitContent for error displaying & retry */}
                    <DatalensChartkitContent
                        nonBodyScroll={nonBodyScroll}
                        requestId={requestId}
                        error={error}
                        onLoad={handleRenderChart}
                        onChange={handleChange}
                        onError={handleError}
                        onRetry={handleRetry}
                        loadedData={loadedData}
                        forwardedRef={forwardedRef}
                        rootNodeRef={rootNodeRef}
                    />
                </div>
            </div>
        </div>
    );
};
