import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';
import type {StringParams} from 'shared';

import type {OnChangeData, WidgetDashState} from '../../../types';

export type WidgetDimensions = {
    width: number;
    height: number;
};

export type BlankChartWidgetProps = {
    id: string;
    data: {
        data: {
            render: (options: WidgetDimensions | undefined) => any;
            events?: {
                click: (event: any) => void;
                keydown: (event: any) => void;
            };
        };
        config: any;
        unresolvedParams?: StringParams;
    };
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onLoad?: (data?: ChartKitOnLoadData<'blank-chart'>) => void;
    widgetDashState?: WidgetDashState;
};
