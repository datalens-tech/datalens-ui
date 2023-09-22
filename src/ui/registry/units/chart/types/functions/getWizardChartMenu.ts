import {MenuItemsIds} from 'shared';

import {ChartKitDataProvider} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import {MenuItemConfig} from '../../../../../libs/DatalensChartkit/menu/Menu';

export type GetWizardChartMenuArgs = {
    chartsDataProvider: ChartKitDataProvider;
    customOptions: Record<MenuItemsIds, Partial<MenuItemConfig>>;
};
