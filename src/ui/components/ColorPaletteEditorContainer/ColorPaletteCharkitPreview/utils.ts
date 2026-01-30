import type {BarXSeries, BarXSeriesData, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {interpolateRgbBasis, scaleSequential} from 'd3';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import range from 'lodash/range';

import type {ColorPaletteChartkitPreviewProps} from './types';

const DATA_WITHOUT_GRAPHS: ChartData = {
    series: {data: []},
    chart: {margin: {left: 5}},
    legend: {enabled: false},
    tooltip: {enabled: false},
    xAxis: {type: 'category'},
    yAxis: [{min: 0, lineColor: 'transparent'}],
};

const getColorFn = (colors: string[]) => {
    const domain = [1, 12];

    if (colors.length > 2) {
        const domainMiddle = (domain[1] - domain[0]) / 2;
        const firstColors = scaleSequential(
            [domain[0], domainMiddle],
            interpolateRgbBasis(colors.slice(0, 2)),
        );
        const lastColors = scaleSequential(
            [domainMiddle, domain[1]],
            interpolateRgbBasis(colors.slice(1)),
        );

        return (colorValue: number) =>
            colorValue >= domainMiddle ? lastColors(colorValue) : firstColors(colorValue);
    }

    return scaleSequential(domain, colors);
};

const getGradientBarXData = (colors: string[]): {categories: string[]; data: BarXSeries} => {
    const getColor = getColorFn(colors);
    const categories = range(1, 13).map((num) => String(num));
    const data: BarXSeriesData[] = categories.map((category) => ({
        x: category,
        y: Number(category),
        color: getColor(Number(category)),
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
}: Omit<ColorPaletteChartkitPreviewProps, 'onPluginLoaded'>): ChartData => {
    const widgetData = cloneDeep(DATA_WITHOUT_GRAPHS);
    const {categories, data} = isGradient
        ? getGradientBarXData(colors)
        : getPaletteBarXData(colors);
    merge(widgetData.xAxis, {categories});
    merge(widgetData.series, {data: [data]});

    return widgetData;
};
