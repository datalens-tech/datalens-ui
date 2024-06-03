import type {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import type {ChartWidgetDataRef} from '../../../../../components/Widgets/Chart/types';
import type {ChartsProps} from '../../../../../libs/DatalensChartkit/modules/data-provider/charts';
import type {LoadedWidgetData} from '../../../../../libs/DatalensChartkit/types';

export type ChartActionPanelButtonProps = {
    loadedData: LoadedWidgetData;
    className?: string;
    menuType?: GetChartkitMenuByType['type'];
    widgetDataRef?: ChartWidgetDataRef;
    chartData?: ChartsProps;
};
