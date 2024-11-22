import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';

import type {OnChangeData, TableWidgetData, WidgetDashState} from '../../../types';

export type TableWidgetProps = {
    id: string;
    data: TableWidgetData;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onLoad?: (data?: ChartKitOnLoadData<'table'>) => void;
    widgetDashState?: WidgetDashState;
    backgroundColor?: string;
};
