import type {
    ChartKitWidgetData,
    PieSeries,
    PieSeriesData,
} from '@gravity-ui/chartkit/build/types/widget-data';

import {ServerField} from '../../../../../../../shared';
import {getFormattedLabel} from '../../d3/utils/dataLabels';
import {PrepareFunctionArgs} from '../types';

import preparePie, {PieConfig} from './preparePie';

type MapPieSeriesArgs = {
    graph: PieConfig;
    isLabelsEnabled?: boolean;
    labelField?: ServerField;
};

function mapPieSeries(args: MapPieSeriesArgs): PieSeries {
    const {graph, isLabelsEnabled, labelField} = args;

    return {
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
                };

                if (isLabelsEnabled) {
                    dataItem.label = getFormattedLabel(item.label, labelField);
                }

                return dataItem;
            }) || [],
    };
}

export function prepareD3Pie(args: PrepareFunctionArgs): ChartKitWidgetData {
    const {labels} = args;
    const {graphs, label, measure} = preparePie(args);
    const isLabelsEnabled = Boolean(labels?.length && label && measure?.hideLabelMode !== 'hide');

    return {
        series: {
            data: graphs.map((graph) => mapPieSeries({graph, labelField: label, isLabelsEnabled})),
        },
    };
}
