import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';
import type {StringParams} from 'shared';

import type {OnChangeData, WidgetDashState} from '../../../types';

export type WidgetDimensions = {
    top: number;
    left: number;
    width: number;
    height: number;
};

export type AdvancedChartWidgetProps = {
    id: string;
    data: {
        data: {
            render: (options: WidgetDimensions | undefined) => any;
            events?: {
                click: (event: any) => void;
                keydown: (event: any) => void;
            };
            tooltip?: {
                renderer: (args: unknown) => any;
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
    onLoad?: (data?: ChartKitOnLoadData<'advanced-chart'>) => void;
    widgetDashState?: WidgetDashState;
};
