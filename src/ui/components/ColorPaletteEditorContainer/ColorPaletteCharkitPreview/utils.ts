import type {BarXSeries, BarXSeriesData, ChartKitWidgetData} from '@gravity-ui/chartkit';
import {interpolateRgbBasis, scaleSequential} from 'd3';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import range from 'lodash/range';

import type {ColorPaletteChartkitPreviewProps} from './types';

const DATA_WITHOUT_GRAPHS: ChartKitWidgetData = {
    series: {data: []},
    chart: {margin: {left: 5}},
    legend: {enabled: false},
    tooltip: {enabled: false},
    xAxis: {type: 'category'},
    yAxis: [{min: 0, lineColor: 'transparent'}],
};

const getGradientBarXData = (colors: string[]): {categories: string[]; data: BarXSeries} => {
    const color = scaleSequential([1, 12], interpolateRgbBasis(colors));
    const categories = range(1, 13).map((num) => String(num));
    const data: BarXSeriesData[] = categories.map((category) => ({
        x: category,
        y: Number(category),
        color: color(Number(category)),
    }));

    return {categories, data: {type: 'bar-x', name: 'name', data}};
};

const getPaletteBarXData = (colors: string[]): {categories: string[]; data: BarXSeries} => {
    const categories = colors.map((_, index) => String(index + 1));
    const data: BarXSeriesData[] = colors.map((color, i) => ({
        x: String(i + 1),
        y: i + 1,
        color,
    }));

    return {categories, data: {type: 'bar-x', name: 'name', data}};
};

export const getWidgetData = ({
    colors,
    isGradient,
}: Omit<ColorPaletteChartkitPreviewProps, 'onPluginLoaded'>): ChartKitWidgetData => {
    const widgetData = cloneDeep(DATA_WITHOUT_GRAPHS);
    const {categories, data} = isGradient
        ? getGradientBarXData(colors)
        : getPaletteBarXData(colors);
    merge(widgetData.xAxis, {categories});
    merge(widgetData.series, {data: [data]});

    return widgetData;
};
