import type {
    ChartKitWidgetData,
    PieSeries,
    PieSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import type {SeriesExportSettings, ServerField} from '../../../../../../../shared';
import {WizardVisualizationId, formatNumber, getFormatOptions} from '../../../../../../../shared';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
import {getExportColumnSettings} from '../../utils/export-helpers';
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
    ChartEditor: PrepareFunctionArgs['ChartEditor'];
};

type ExtendedPieSeriesData = PieSeriesData & {
    drillDownFilterValue?: string;
};

type ExtendedPieSeries = PieSeries & {
    custom?: {
        totals?: string;
        exportSettings?: SeriesExportSettings;
    };
};

function mapPieSeries(args: MapPieSeriesArgs) {
    const {graph, isLabelsEnabled, measureField, labelField, visualizationId, totals, ChartEditor} =
        args;

    const seriesConfig: ExtendedPieSeries = {
        type: 'pie',
        dataLabels: {
            enabled: isLabelsEnabled,
        },
        data:
            graph.data?.map<PieSeriesData>((item) => {
                const dataItem: ExtendedPieSeriesData = {
                    value: item.y,
                    color: String(item.color),
                    name: item.name,
                    custom: item.custom,
                    drillDownFilterValue: item.drillDownFilterValue,
                };

                if (isLabelsEnabled) {
                    dataItem.label = getFormattedLabel(item.label as string | number, labelField);
                }

                return dataItem;
            }) || [],
    };

    seriesConfig.custom = {
        exportSettings: {
            columns: [
                {
                    name: ChartEditor.getTranslation('chartkit.data-provider', 'categories'),
                    field: 'name',
                },
                getExportColumnSettings({path: 'value', field: measureField}),
            ],
        },
    };

    if (visualizationId === WizardVisualizationId.DonutD3) {
        seriesConfig.innerRadius = '50%';

        if (measureField && totals) {
            seriesConfig.custom = {
                ...seriesConfig.custom,
                totals: formatNumber(Number(totals), getFormatOptions(measureField)),
            };
        }
    }

    return seriesConfig;
}

export function prepareD3Pie(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {labels, visualizationId, ChartEditor} = args;
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
                    ChartEditor,
                }),
            ),
        },
    };
}
