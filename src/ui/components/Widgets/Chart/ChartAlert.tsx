import React from 'react';

import block from 'bem-cn-lite';
import {usePrevious} from 'hooks';
import isEqual from 'lodash/isEqual';
import omit from 'lodash/omit';
import pick from 'lodash/pick';
import {useLoadingChart} from 'ui/components/Widgets/Chart/hooks/useLoadingChart';
import {DL} from 'ui/constants/common';
import {DatalensChartkitContent} from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/Chart/Chart';
import Loader from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/Loader/Loader';
import {getDataProviderData} from 'ui/libs/DatalensChartkit/components/ChartKitBase/helpers';
import settings from 'ui/libs/DatalensChartkit/modules/settings/settings';

import {
    COMPONENT_CLASSNAME,
    getPreparedConstants,
    removeEmptyNDatasetFieldsProperties,
} from './helpers/helpers';
import type {
    ChartAlertProps,
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
export const ChartAlert = (props: ChartAlertProps) => {
    const {
        dataProvider,
        forwardedRef,
        config,
        id: chartId,
        onChartRender,
        onChartLoad,
        onLoadStart,
    } = props;

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
            }),
        [config, chartId, chartkitParams],
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

    /**
     * for correct cancellation on rerender & changed request params & data props
     */
    const requestId = React.useMemo(
        () => settings.requestIdGenerator(DL.REQUEST_ID_PREFIX),
        [hasChangedOuterProps, hasChangedOuterParams],
    );

    const rootNodeRef = React.useRef<HTMLDivElement>(null);
    const widgetDataRef = React.useRef<ChartWidgetData>(null);
    const widgetRenderTimeRef = React.useRef<number | null>(null);

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
        error,
        handleRenderChart,
        handleChange,
        handleRetry,
        handleError,
    } = useLoadingChart({
        chartKitRef: forwardedRef,
        dataProvider,
        initialData,
        requestId,
        requestCancellationRef,
        rootNodeRef,
        hasChangedOuterProps,
        hasChangedOuterParams,
        widgetDataRef,
        widgetRenderTimeRef,
        onChartRender,
        onChartLoad,
        ignoreUsedParams: true,
        clearedOuterParams,
        enableActionParams: true,
    });

    const {mods} = React.useMemo(
        () =>
            getPreparedConstants({
                isLoading,
                error,
                loadedData,
                isReloadWithNoVeil: false,
                noLoader: false,
                noVeil: true,
                isSilentReload: false,
            }),
        [isLoading, error, loadedData],
    );

    React.useEffect(() => {
        onLoadStart?.();
    }, [isLoading]);

    return (
        <div ref={rootNodeRef} className={`${b(mods)}`}>
            <Loader visible={isLoading} />
            <DatalensChartkitContent
                noControls={true}
                nonBodyScroll={true}
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
    );
};
