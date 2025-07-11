import type {MenuItemsConfig} from '../../menu/Menu';
import type {MenuCommentsItemVisibleArgs, MenuItemArgs} from '../../menu/MenuItems';
import type {ChartsProps} from '../../modules/data-provider/charts';

import type {DataProps} from './types';

export const CHARTKIT_BASE_CLASSNAME = 'chartkit-base';

function isVisibleItem({
    isVisible,
    data,
}: {
    isVisible: (data?: MenuItemArgs | MenuCommentsItemVisibleArgs) => boolean;
    data?: MenuItemArgs | MenuCommentsItemVisibleArgs;
}) {
    try {
        return isVisible(data);
    } catch (error) {
        return false;
    }
}

export function getVisibleItems(
    items: MenuItemsConfig | Array<MenuItemsConfig>,
    data: MenuItemArgs | MenuCommentsItemVisibleArgs,
) {
    if (Array.isArray(items) && Array.isArray(items[0])) {
        return (items as Array<MenuItemsConfig>)
            .map((item) => item.filter((menu) => isVisibleItem({isVisible: menu.isVisible, data})))
            .filter(Boolean);
    }

    return (items as MenuItemsConfig).filter((item) =>
        isVisibleItem({isVisible: item.isVisible, data}),
    );
}

export const getDataProviderData = ({id, params, config, workbookId, widgetData}: ChartsProps) => {
    const data: DataProps = {
        params: {},
    };

    if (id) {
        data.id = id;
    }
    if (params) {
        data.params = params;
    }
    if (config) {
        data.config = config;
    }
    if (workbookId) {
        data.workbookId = workbookId;
    }
    if (widgetData) {
        data.widgetData = widgetData;
    }
    return data;
};
