import type {CancelTokenSource} from 'axios';
import type {ChartsData, ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';

import type ChartKitBase from '../components/ChartKitBase/ChartKitBase';

/**
 * the described type for the old chartkit is still used in the following places:
 * - alert modal
 * - editorial selectors
 * - controls inside charts
 */
export type ChartsChartKit = ChartKitBase<ChartsProps, ChartsData, CancelTokenSource>;
