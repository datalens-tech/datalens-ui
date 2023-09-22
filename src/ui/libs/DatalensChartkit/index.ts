import type {CancelTokenSource} from 'axios';

import {
    type ChartsData,
    ChartsDataProvider,
    type ChartsProps,
} from './modules/data-provider/charts';
import withDataProvider from './modules/data-provider/withDataProvider';

export const chartsDataProvider = new ChartsDataProvider();

const ChartKitWithCharts = withDataProvider<ChartsProps, ChartsData, CancelTokenSource>(
    // @ts-ignore Error after migration to TS 4.9
    chartsDataProvider,
);

export default ChartKitWithCharts;
