import React from 'react';

import {HighchartsReact} from '@gravity-ui/chartkit/highcharts';
import type {ChartCallbackFunction, Options} from 'highcharts';
import Highcharts from 'highcharts';
import highmaps from 'highcharts/modules/map';
import get from 'lodash/get';

import Performance from '../../../../modules/perfomance';
import {getRandomCKId} from '../../../helpers/getRandomCKId';
import {getMap} from '../../../modules/map/map';
import {withSplitPane} from '../../components';
import type {HighchartsMapWidgetProps} from '../types';

highmaps(Highcharts);

const HighcharsReactWithSplitPane = withSplitPane(HighchartsReact);

type HighchartsMapComponentProps = HighchartsMapWidgetProps;

type HighchartsMapComponentState = {
    prevData: HighchartsMapWidgetProps['data'] | null;
    options: Options | null;
    callback: ChartCallbackFunction | null;
};

export class HighchartsMapComponent extends React.PureComponent<
    HighchartsMapComponentProps,
    HighchartsMapComponentState
> {
    static getDerivedStateFromProps(
        nextProps: HighchartsMapComponentProps,
        prevState: HighchartsMapComponentState,
    ) {
        const isCurrentTooltipSplitted = get(prevState, 'options.tooltip.splitTooltip');
        const tooltipTypeWasChanged = isCurrentTooltipSplitted !== nextProps.splitTooltip;

        // in the case when there was a change in the type of the tooltip, even if the data has not changed, you need to call GetMap
        // to get and update the value of the highcharts config
        if (nextProps.data === prevState.prevData && !tooltipTypeWasChanged) {
            return null;
        }

        const {
            nonBodyScroll,
            data: {data, libraryConfig, config},
        } = nextProps;
        const {config: options, callback} = getMap(
            Object.assign(
                {
                    nonBodyScroll,
                    splitTooltip: nextProps.splitTooltip,
                    highcharts: libraryConfig,
                },
                config,
            ),
            data,
        );

        return {
            prevData: nextProps.data,
            options,
            callback,
        };
    }

    generatedId = `${this.props.id}_${getRandomCKId()}`;

    state: HighchartsMapComponentState = {
        prevData: null,
        options: null,
        callback: null,
    };

    widget: Highcharts.Chart | null = null;
    chartComponent = React.createRef<{
        chart: Highcharts.Chart;
        container: React.RefObject<HTMLDivElement>;
    }>();

    componentDidMount() {
        this.forceReflow();
        this.props.onChartLoad?.({widget: this.widget});
    }

    componentDidUpdate() {
        this.forceReflow();
    }

    render() {
        const {options, prevData} = this.state;
        const Component = this.props.splitTooltip ? HighcharsReactWithSplitPane : HighchartsReact;
        Performance.mark(this.generatedId);

        return (
            <Component
                // similar to Graph
                // this is done to make Highcharts does not update the map, but deletes and draws
                key={Math.random()}
                options={options}
                highcharts={Highcharts}
                constructorType={'mapChart'}
                onPaneChange={this.props.splitTooltip ? this.forceReflow : undefined}
                callback={(chart: Highcharts.Chart) => {
                    this.widget = chart;
                    const data = {
                        widget: chart,
                        widgetData: options,
                        loadedData: prevData,
                        widgetRendering: Performance.getDuration(this.generatedId),
                    };
                    this.state.callback?.(chart);
                    this.props.onLoad?.(data);
                }}
                // @ts-ignore
                ref={this.chartComponent}
            />
        );
    }

    forceReflow = () => {
        const container = this.chartComponent.current?.container.current;

        if (container) {
            container.style.height = '100%';
            container.style.width = '100%';
        }

        // can be called after unmount, so check the ref
        window.requestAnimationFrame(() => {
            if (this.chartComponent.current) {
                this.chartComponent.current.chart.reflow();
            }
        });
    };
}
