import type {MenuItemsIds} from 'shared';

import type {ChartKitDataProvider} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {MenuItemConfig} from '../../../../../libs/DatalensChartkit/menu/Menu';

export type GetWizardChartMenuArgs = {
    chartsDataProvider: ChartKitDataProvider;
    customOptions: Record<MenuItemsIds, Partial<MenuItemConfig>>;
    extraOptions?: Record<string, unknown>;
};
