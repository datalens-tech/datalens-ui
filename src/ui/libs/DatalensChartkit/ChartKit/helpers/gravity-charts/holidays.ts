import type {AxisPlotBand, ChartData} from '@gravity-ui/chartkit/gravity-charts';
import {dateTimeUtc} from '@gravity-ui/date-utils';
import get from 'lodash/get';
import max from 'lodash/max';
import min from 'lodash/min';
import type {ChartKitHolidays} from 'ui/store/toolkit/chartkit/types';

import type {ChartKitAdapterProps} from '../../types';

export function convertHolidaysToPlotBands({
    holidays,
    region = 'ru',
    loadedData,
}: {
    holidays: ChartKitHolidays | undefined;
    region?: string;
    loadedData: ChartKitAdapterProps['loadedData'];
}): AxisPlotBand[] {
    const plotBands: AxisPlotBand[] = [];

    const chartData = loadedData?.data as ChartData;
    if (chartData?.xAxis?.type !== 'datetime') {
        return [];
    }

    const chartSeriesDates = chartData.series.data
        .map((s) => s.data.map((d) => get(d, 'x')))
        .flat(2);
    const minDate = min(chartSeriesDates);
    const maxDate = max(chartSeriesDates);

    const items = {...holidays?.weekend[region], ...holidays?.holiday[region]};

    Object.keys(items).forEach((item) => {
        const weekendDate = dateTimeUtc({input: item, format: 'YYYYMMDD'});
        const from = weekendDate.valueOf();
        const to = weekendDate.add(1, 'day').valueOf();

        if (from > maxDate || to < minDate) {
            return;
        }

        const plotBand: AxisPlotBand = {
            from,
            to,
            color: 'var(--g-color-base-generic)',
            layerPlacement: 'before',
        };
        plotBands.push(plotBand);
    });

    return plotBands;
}
