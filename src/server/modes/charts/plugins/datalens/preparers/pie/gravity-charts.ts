import type {PieSeries, PieSeriesData} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import type {SeriesExportSettings} from '../../../../../../../shared';
import {formatNumber, getFormatOptions} from '../../../../../../../shared';
import {getFakeTitleOrTitle} from '../../../../../../../shared/modules/fields';
import {isHtmlField, isMarkdownField, isMarkupField} from '../../../../../../../shared/types/index';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {getFieldFormatOptions} from '../../gravity-charts/utils/format';
import {getExportColumnSettings} from '../../utils/export-helpers';
import type {PiePoint, PrepareFunctionArgs} from '../types';

import preparePieData from './prepare-pie-data';
import {getFormattedValue, isColoringByMeasure, isDonut} from './utils';

type ExtendedPieSeriesData = Omit<PieSeriesData, 'label'> & {
    drillDownFilterValue?: string;
    formattedValue: string | null;
    percentage: number;
    label?: PiePoint['label'];
};

type ExtendedPieSeries = Omit<PieSeries, 'data'> & {
    custom?: {
        totals?: string;
        exportSettings?: SeriesExportSettings;
    };
    data: ExtendedPieSeriesData[];
};

export function prepareD3Pie(args: PrepareFunctionArgs) {
    const {shared, labels, visualizationId, ChartEditor, colorsConfig, idToDataType} = args;
    const {graphs, label, measure, totals} = preparePieData(args);
    const isLabelsEnabled = Boolean(labels?.length && label && measure?.hideLabelMode !== 'hide');

    const shouldUseHtmlForLabels =
        isMarkupField(label) || isHtmlField(label) || isMarkdownField(label);

    let data: ExtendedPieSeries[] = [];

    if (measure && graphs.length > 0) {
        const graph = graphs[0];
        const total = graph.data?.reduce((sum, d) => sum + (d.y || 0), 0) ?? 0;
        const seriesConfig: ExtendedPieSeries = {
            type: 'pie',
            dataLabels: {
                enabled: isLabelsEnabled,
                html: shouldUseHtmlForLabels,
                format: getFieldFormatOptions({field: label}),
                style: {
                    fontSize: '12px',
                },
            },
            data:
                graph.data?.map((item) => {
                    return {
                        ...item,
                        value: item.y,
                        color: String(item.color),
                        formattedValue: getFormattedValue(String(item.y), {
                            ...measure,
                            data_type: idToDataType[measure.guid],
                        }),
                        percentage: item.y / total,
                    };
                }) ?? [],
            legend: {
                symbol: {
                    width: 10,
                    height: 10,
                    padding: 4,
                },
            },
        };

        seriesConfig.custom = {
            exportSettings: {
                columns: [
                    {
                        name: ChartEditor.getTranslation('chartkit.data-provider', 'categories'),
                        field: 'name',
                    },
                    getExportColumnSettings({path: 'value', field: measure}),
                ],
            },
        };

        if (isDonut({visualizationId})) {
            seriesConfig.innerRadius = '50%';

            if (measure && totals) {
                seriesConfig.custom = {
                    ...seriesConfig.custom,
                    totals: formatNumber(Number(totals), getFormatOptions(measure)),
                };
            }
        }

        data.push(seriesConfig);
    } else {
        data = [];
    }

    let legend;
    if (graphs.length && isColoringByMeasure(args)) {
        legend = {
            enabled: true,
            type: 'continuous',
            title: {text: getFakeTitleOrTitle(measure)},
            colorScale: {
                colors: colorsConfig.gradientColors,
                stops: colorsConfig.gradientColors.length === 2 ? [0, 1] : [0, 0.5, 1],
            },
        };
    }

    const isLegendEnabled =
        shared?.extraSettings?.legendMode !== 'hide' &&
        (legend?.enabled || data[0]?.data.length > 1);

    return merge(getBaseChartConfig(shared), {
        chart: {
            margin: isLegendEnabled
                ? {top: 20, left: 20, right: 20, bottom: 20}
                : {top: 30, left: 30, right: 30, bottom: 35},
        },
        series: {
            data,
        },
        legend,
    });
}
