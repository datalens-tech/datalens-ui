import React from 'react';

import {ErrorBoundary} from 'ui/components/ErrorBoundary/ErrorBoundary';
import {ChartkitError} from 'ui/libs/DatalensChartkit/components/ChartKitBase/components/ChartkitError/ChartkitError';

import {chartsDataProvider} from '../../../libs/DatalensChartkit';
import type {ChartKitDataProvider} from '../../../libs/DatalensChartkit/components/ChartKitBase/types';

import {Chart as ChartComponent} from './Chart';
import {ChartSelector as ChartSelectorComponent} from './ChartSelector';
import {ChartWidget as ChartWidgetComponent} from './ChartWidget';
import type {
    ChartSelectorWidgetProps,
    ChartWidgetProviderPropsWithRefProps,
    ChartWithProviderWithRefProps,
    ChartWrapperWithProviderProps,
} from './types';

/**
 * is needed for proper component props typing
 * @param props
 */
function isChartType(props: ChartWrapperWithProviderProps): props is ChartWithProviderWithRefProps {
    return props.usageType === 'chart';
}

function isSelectorType(
    props: ChartWrapperWithProviderProps | ChartSelectorWidgetProps,
): props is ChartSelectorWidgetProps {
    return props.usageType === 'control';
}

export class ChartWrapperComponent extends React.Component<ChartWrapperWithProviderProps> {
    dataProvider: ChartKitDataProvider;

    constructor(props: ChartWrapperWithProviderProps) {
        super(props);
        // using singletone instance of class ChartsDataProvider because of manipulations with
        // axios instance for limiting concurent requests
        this.dataProvider = chartsDataProvider as ChartKitDataProvider;
    }

    render() {
        if (isChartType(this.props)) {
            return (
                <ChartComponent
                    {...this.props}
                    dataProvider={this.dataProvider}
                    ignoreUsedParams={true}
                    key="chart"
                />
            );
        }

        if (isSelectorType(this.props)) {
            return (
                <ChartSelectorComponent
                    {...this.props}
                    dataProvider={this.dataProvider}
                    key="selector"
                />
            );
        }

        const props = this.props as ChartWidgetProviderPropsWithRefProps;
        return (
            <ChartWidgetComponent
                {...props}
                dataProvider={this.dataProvider}
                compactLoader={true}
                key="widget"
            />
        );
    }
}

export const ChartWrapper = (props: ChartWrapperWithProviderProps) => {
    return (
        <ErrorBoundary renderError={(error) => <ChartkitError error={error} />}>
            <ChartWrapperComponent {...props} />
        </ErrorBoundary>
    );
};
