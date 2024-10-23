import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';

import type {OnChangeData, WidgetDashState} from '../../../types';

export type WidgetDimensions = {
    width: number;
    height: number;
};

export type WhiteBoxWidgetProps = {
    id: string;
    data: {
        data: {
            render: (options: WidgetDimensions & {}) => any;
        };
        config: any;
    };
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onLoad?: (data?: ChartKitOnLoadData<'white-box'>) => void;
    widgetDashState?: WidgetDashState;
};
