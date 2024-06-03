import type {MenuItemsIds} from 'shared';
import type {ChartKitDataProvider} from 'ui/libs/DatalensChartkit/components/ChartKitBase/types';
import type {MenuItemConfig, MenuType} from 'ui/libs/DatalensChartkit/menu/Menu';

export type GetChartkitMenuByType = GetChartkitMenuItems & {
    onExportLoading?: (isLoading: boolean) => void;
    onFullscreenClick?: () => void;
    isEditAvaible?: boolean;
    extraOptions?: Record<string, unknown>;
};

export type GetChartkitMenuItems = {
    type?: MenuType | string;
    config?: {
        canEdit?: boolean;
    };
    customOptions?: Record<MenuItemsIds, Partial<MenuItemConfig>>;
    chartsDataProvider: ChartKitDataProvider;
    extraOptions?: Record<string, unknown>;
};
