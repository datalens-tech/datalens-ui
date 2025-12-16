import type {ChartData, FunnelSeries} from '@gravity-ui/chartkit/gravity-charts';
import merge from 'lodash/merge';

import {PlaceholderId, getFakeTitleOrTitle} from '../../../../../../../shared';
import {getBaseChartConfig} from '../../gravity-charts/utils';
import {findIndexInOrder} from '../../utils/misc-helpers';
import type {PrepareFunctionArgs} from '../types';

export function prepareFunnel({
    shared,
    idToTitle,
    resultData,
    placeholders,
}: PrepareFunctionArgs): Partial<ChartData> {
    const series: FunnelSeries = {
        type: 'funnel',
        name: '',
        data: [],
    };

    const measures = placeholders.find((p) => p.id === PlaceholderId.Measures)?.items ?? [];

    const {data, order} = resultData;
    data.forEach((values) => {
        measures.forEach((measureItem) => {
            const actualTitle = idToTitle[measureItem.guid];
            const i = findIndexInOrder(order, measureItem, actualTitle);
            const value = values[i];

            series.data.push({
                value: Number(value),
                name: getFakeTitleOrTitle(measureItem),
            });
        });
    });

    return merge(getBaseChartConfig(shared), {
        series: {
            data: [series],
        },
        legend: {
            enabled: false,
        },
        chart: {
            zoom: {enabled: false},
        },
    });
}
