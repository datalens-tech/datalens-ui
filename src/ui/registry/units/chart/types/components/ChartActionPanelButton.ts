import {GetChartkitMenuByType} from 'ui/registry/units/chart/types/functions/getChartkitMenuByType';

import {ChartWidgetDataRef} from '../../../../../components/Widgets/Chart/types';
import {ChartsProps} from '../../../../../libs/DatalensChartkit/modules/data-provider/charts';
import {LoadedWidgetData} from '../../../../../libs/DatalensChartkit/types';

export type ChartActionPanelButtonProps = {
    loadedData: LoadedWidgetData;
    className?: string;
    menuType?: GetChartkitMenuByType['type'];
    widgetDataRef?: ChartWidgetDataRef;
    chartData?: ChartsProps;
};
