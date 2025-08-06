import type {AxiosError} from 'axios';
import type {ExportParams} from 'shared';
import type {ChartWidgetDataRef} from 'ui/components/Widgets/Chart/types';
import type {MenuLoadedData} from 'ui/libs/DatalensChartkit/menu/Menu';
import type {ChartsData, ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type DatalensChartkitCustomError from 'ui/libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {WidgetBase} from 'ui/libs/DatalensChartkit/types';

import type {ChartKitProps} from '../../../../../../ChartKitBase';
import type {LoadedChartInfo} from '../../../../../../types';
import { Dispatch } from 'redux';

export type ExportResultType = {
    status: string;
    isCopyToClipboard?: boolean;
    data?: string;
    error?: AxiosError<Body>;
};

export type ExportActionArgs = {
    loadedData: MenuLoadedData & {exportFilename: string};
    propsData: ChartKitProps<ChartsProps, ChartsData>;
    widget: Highcharts.Chart & LoadedChartInfo & WidgetBase;
    widgetDataRef: ChartWidgetDataRef;
    event: React.MouseEvent;
    error?: DatalensChartkitCustomError;
    dispatch?: Dispatch
};

export type ExportChartArgs = {
    chartData: ExportActionArgs;
    params?: ExportParams;
    onExportLoading?: (isLoading: boolean) => void;
    chartRevId?: string;
};
