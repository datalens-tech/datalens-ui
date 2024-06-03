import type {
    ChartKitWidgetData,
    PieSeries,
    PieSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import type {ServerField} from '../../../../../../../shared';
import {WizardVisualizationId, formatNumber, getFormatOptions} from '../../../../../../../shared';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
import type {PrepareFunctionArgs} from '../types';

import type {PieConfig} from './prepare-pie-data';
import preparePieData from './prepare-pie-data';

type MapPieSeriesArgs = {
    graph: PieConfig;
    isLabelsEnabled?: boolean;
    labelField?: ServerField;
    measureField?: ServerField;
    visualizationId: WizardVisualizationId;
    totals?: string | null;
};

type ExtendedPieSeries = PieSeries & {custom?: {totals?: string}};

function mapPieSeries(args: MapPieSeriesArgs) {
    const {graph, isLabelsEnabled, measureField, labelField, visualizationId, totals} = args;

    const seriesConfig: ExtendedPieSeries = {
        type: 'pie',
        dataLabels: {
            enabled: isLabelsEnabled,
        },
        data:
            graph.data?.map<PieSeriesData>((item) => {
                const dataItem: PieSeriesData = {
                    value: item.y,
                    color: String(item.color),
                    name: item.name,
                    custom: item.custom,
                };

                if (isLabelsEnabled) {
                    dataItem.label = getFormattedLabel(item.label, labelField);
                }

                return dataItem;
            }) || [],
    };

    if (visualizationId === WizardVisualizationId.DonutD3) {
        seriesConfig.innerRadius = '50%';

        if (measureField && totals) {
            seriesConfig.custom = {
                totals: formatNumber(Number(totals), getFormatOptions(measureField)),
            };
        }
    }

    return seriesConfig;
}

export function prepareD3Pie(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {labels, visualizationId} = args;
    const {graphs, label, measure, totals} = preparePieData(args);
    const isLabelsEnabled = Boolean(labels?.length && label && measure?.hideLabelMode !== 'hide');

    return {
        series: {
            data: graphs.map((graph) =>
                mapPieSeries({
                    graph,
                    labelField: label,
                    isLabelsEnabled,
                    visualizationId: visualizationId as WizardVisualizationId,
                    totals,
                    measureField: measure,
                }),
            ),
        },
    };
}
