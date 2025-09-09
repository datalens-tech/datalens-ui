import React from 'react';

import {HighchartsReact} from '@gravity-ui/chartkit/highcharts';
import block from 'bem-cn-lite';
import Highcharts from 'highcharts';
import merge from 'lodash/merge';

import {getGraph} from '../../../modules/graph/graph';
import type {MetricTileProps, MetricWidgetDataItem} from '../types';

import {
    GREEN_BACKGROUND,
    GREEN_COLOR,
    RED_BACKGROUND,
    RED_COLOR,
    formatValue,
    getBackground,
    getFormattedValue,
    getUnitValue,
    graphOptions,
} from './metricHelpers';

import './MetricTile.scss';

const b = block('metric-tile');

export class MetricTile extends React.PureComponent<MetricTileProps> {
    render() {
        const {data, isMobile} = this.props;
        const {title, colorize, background, content} = data;
        const {current, last} = content;

        let contentBackground = background;

        if (colorize && !contentBackground) {
            contentBackground = getBackground(data, GREEN_BACKGROUND, RED_BACKGROUND);
        }

        return (
            <div className={b()} style={contentBackground ? {background: contentBackground} : {}}>
                <div className={b('content')}>
                    <div className={b('title')} title={title}>
                        {title || ''}
                    </div>

                    <div className={b('current')}>{current.text || ''}</div>

                    <div className={b('metric')}>
                        <span
                            className={b('value')}
                            style={current.color ? {color: current.color} : {}}
                        >
                            {getFormattedValue(current)}
                        </span>

                        <div className={b('aside')}>
                            <div className={b('diff-container')}>
                                {content.diff && this.renderDiff(content, 'diff', colorize)}
                                {content.diffPercent &&
                                    this.renderDiff(content, 'diffPercent', colorize)}
                            </div>

                            <span
                                className={b('unit')}
                                style={current.color ? {color: current.color} : {}}
                            >
                                {getUnitValue(current)}
                            </span>
                        </div>
                    </div>

                    {last && (
                        <React.Fragment>
                            <div className={b('last')}>{last.text || ''}</div>
                            <div
                                className={b('last-value')}
                                style={last.color ? {color: last.color} : {}}
                            >
                                {getFormattedValue(last)}
                                <span className={b('last_unit')}> {getUnitValue(last)}</span>
                            </div>
                        </React.Fragment>
                    )}

                    {data.chart && Array.isArray(data.chart.graphs) && (
                        <div className={b('chart')}>{this.renderChart(data, isMobile)}</div>
                    )}
                </div>
            </div>
        );
    }

    private renderChart = (data: MetricWidgetDataItem, isMobile?: boolean) => {
        const {chart, colorize} = data;

        const chartConfig = {
            dataSources: this.props.config?.dataSources,
            chartType: 'editor',
            width: '100%',
            highcharts: {},
        };

        merge(chartConfig, this.props.config?.statface_graph || {}, {highcharts: graphOptions});

        if (
            !chart ||
            (typeof chart === 'object' && !Object.keys(chart).length) ||
            (chart.graphs &&
                !(
                    chart.graphs.length &&
                    chart.graphs.some((graph) => graph.data && graph.data.length)
                )) ||
            (Array.isArray(chart) && !chart.length)
        ) {
            return null;
        }

        if (colorize && !chart.graphs[0].color) {
            chart.graphs[0].color = getBackground(data, GREEN_COLOR, RED_COLOR);
        }

        const {config, callback} = getGraph(chartConfig, chart, undefined, isMobile);
        return (
            <HighchartsReact
                key={Math.random()}
                options={config}
                highcharts={Highcharts}
                callback={callback}
                constructorType="chart"
            />
        );
    };

    // eslint-disable-next-line complexity
    private renderDiff = (
        content: MetricWidgetDataItem['content'],
        diffType: 'diff' | 'diffPercent',
        colorize: string | undefined,
    ) => {
        const data = content[diffType];

        if (!data) {
            return '';
        }

        let className = '';
        let sign = data.sign;
        let value = data.value;
        let unit = data.unit;

        if (data.formatted || !('value' in data)) {
            if (
                !('value' in data) &&
                (!(content.last && 'value' in content.last) || !('value' in content.current))
            ) {
                return '';
            } else if (content.last && !(diffType === 'diffPercent' && content.last.value === 0)) {
                const current = Number(content.current.value);
                const last = Number(content.last.value);
                const diff =
                    diffType === 'diff' ? current - last : (current - last) / Math.abs(last);

                const formattedValue = formatValue(
                    'value' in data ? data.value : diff,
                    true,
                    diffType === 'diff' ? undefined : 'percentage',
                );

                value = formattedValue.value;
                sign = formattedValue.sign;
                unit =
                    data.unit && formattedValue && formattedValue.unit
                        ? formattedValue.unit + (content.diff ? content.diff.unit : '')
                        : formattedValue.unit;
            }
        }

        if (colorize === 'more-green') {
            if (sign === '+') {
                className += b('diff_positive');
            }
            if (sign === '-') {
                className += b('diff_negative');
            }
        }

        if (colorize === 'less-green') {
            if (sign === '+') {
                className += b('diff_negative');
            }
            if (sign === '-') {
                className += b('diff_positive');
            }
        }

        return (
            Boolean(value) && (
                <div
                    className={b(`diff-abs ${className}`)}
                    style={data.color ? {color: data.color} : {}}
                >
                    {sign} {value} <span className={b('diff_unit')}>{unit || ''}</span>
                </div>
            )
        );
    };
}
