import React from 'react';

import type {ChartKitProps, ChartKitType} from '@gravity-ui/chartkit';

import {ChartKitAdapter} from '../../../../ChartKit/ChartKitAdapter';
import settings from '../../../../modules/settings/settings';
import {
    ChartKitBaseWrapperWithRefProps,
    ChartKitWrapperParams,
    ChartKitWrapperState,
} from '../../types';
import {ChartkitError} from '../ChartkitError/ChartkitError';
import {State} from '../Content/store/types';

type ChartProps = Pick<
    ChartKitBaseWrapperWithRefProps,
    'noControls' | 'transformLoadedData' | 'splitTooltip' | 'nonBodyScroll' | 'forwardedRef'
> &
    Pick<ChartKitWrapperParams, 'onLoad' | 'onChange' | 'onError' | 'onRetry'> &
    Pick<ChartKitWrapperState, 'requestId'> &
    Pick<State, 'loadedData' | 'error'> &
    Pick<ChartKitProps<ChartKitType>, 'onRender' | 'onChartLoad' | 'renderPluginLoader'>;

export const Chart = (props: ChartProps) => {
    if (props.error) {
        return (
            <ChartkitError
                error={props.error}
                onRetry={props.onRetry}
                requestId={props.requestId}
                noControls={props.noControls}
            />
        );
    }

    const preparedData =
        typeof props.transformLoadedData === 'function'
            ? props.transformLoadedData(props.loadedData)
            : props.loadedData;

    if (props.loadedData && props.loadedData.type !== 'control') {
        return (
            <ChartKitAdapter
                ref={props.forwardedRef}
                loadedData={preparedData}
                splitTooltip={props.splitTooltip}
                nonBodyScroll={props.nonBodyScroll}
                isMobile={settings.isMobile}
                lang={settings.lang}
                onLoad={props.onLoad}
                onError={props.onError}
                onChange={props.onChange}
                onRender={props.onRender}
                onChartLoad={props.onChartLoad}
                renderPluginLoader={props.renderPluginLoader}
                requestId={props.requestId}
                noControls={props.noControls}
                onRetry={props.onRetry}
            />
        );
    }

    return null;
};

export const DatalensChartkitContent = React.memo(Chart);
