import {MenuItemsIds} from 'shared';
import {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import {MenuItemConfig, MenuType} from 'ui/libs/DatalensChartkit/menu/Menu';

export type GetChartkitMenuByType = GetChartkitMenuItems & {
    onExportLoading?: (isLoading: boolean) => void;
    isEditAvaible?: boolean;
};

export type GetChartkitMenuItems = {
    type?: MenuType | string;
    config?: {
        canEdit?: boolean;
    };
    customOptions?: Record<MenuItemsIds, Partial<MenuItemConfig>>;
    chartsDataProvider: ChartKitDataProvider;
};
