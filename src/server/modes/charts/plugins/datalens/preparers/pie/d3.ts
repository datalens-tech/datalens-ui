import type {PieSeries, PieSeriesData} from '@gravity-ui/chartkit';

import type {SeriesExportSettings} from '../../../../../../../shared';
import {WizardVisualizationId, formatNumber, getFormatOptions} from '../../../../../../../shared';
import {getFakeTitleOrTitle} from '../../../../../../../shared/modules/fields';
import {isMarkdownField, isMarkupField} from '../../../../../../../shared/types/index';
import {getExportColumnSettings} from '../../utils/export-helpers';
import type {PiePoint, PrepareFunctionArgs} from '../types';

import preparePieData from './prepare-pie-data';
import {getFormattedValue, isColoringByMeasure} from './utils';

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
    const {labels, visualizationId, ChartEditor, colorsConfig, idToDataType} = args;
    const {graphs, label, measure, totals} = preparePieData(args);
    const isLabelsEnabled = Boolean(labels?.length && label && measure?.hideLabelMode !== 'hide');
    const isMarkdownLabel = isMarkdownField(label);
    const isMarkupLabel = isMarkupField(label);

    let data: ExtendedPieSeries[] = [];

    if (measure && graphs.length > 0) {
        const graph = graphs[0];
        const total = graph.data?.reduce((sum, d) => sum + (d.y || 0), 0) ?? 0;
        const seriesConfig: ExtendedPieSeries = {
            type: 'pie',
            dataLabels: {
                enabled: isLabelsEnabled,
                html: isMarkdownLabel || isMarkupLabel,
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

        if (visualizationId === WizardVisualizationId.DonutD3) {
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

    return {
        series: {
            data,
        },
        legend,
    };
}
