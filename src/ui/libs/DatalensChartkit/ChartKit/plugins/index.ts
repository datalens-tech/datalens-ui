import {D3Plugin} from '@gravity-ui/chartkit/d3';
import {HighchartsPlugin} from '@gravity-ui/chartkit/highcharts';
import {IndicatorPlugin} from '@gravity-ui/chartkit/indicator';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';

import {BlankChartPlugin} from './BlankChart';
import {HighchartsMapPlugin} from './HighchartsMap';
import {MarkupPlugin} from './Markup';
import {MetricPlugin} from './Metric';
import {TablePlugin} from './Table';
import {YandexMapPlugin} from './YandexMap';

export {MetricPlugin} from './Metric';
export {HighchartsMapPlugin} from './HighchartsMap';
export {YandexMapPlugin} from './YandexMap';
export type {MetricWidgetData, MetricWidgetProps} from './Metric/types';
export type {HighchartsMapWidgetData, HighchartsMapWidgetProps} from './HighchartsMap/types';
export type {YandexMapWidgetData, YandexMapWidgetProps} from './YandexMap/types';
export type {MarkupWidgetData, MarkupWidgetProps} from './Markup/types';

export const getChartkitPlugins = () => [
    YagrPlugin,
    IndicatorPlugin,
    MetricPlugin,
    HighchartsMapPlugin,
    YandexMapPlugin,
    HighchartsPlugin,
    D3Plugin,
    MarkupPlugin,
    TablePlugin,
    BlankChartPlugin,
];
