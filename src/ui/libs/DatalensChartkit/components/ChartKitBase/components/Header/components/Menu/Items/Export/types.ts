import type {AxiosError} from 'axios';
import type {ChartWidgetDataRef} from 'ui/components/Widgets/Chart/types';
import type {MenuLoadedData} from 'ui/libs/DatalensChartkit/menu/Menu';
import type {ExportFormatsType} from 'ui/libs/DatalensChartkit/modules/constants/constants';
import type {ChartsData, ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type DatalensChartkitCustomError from 'ui/libs/DatalensChartkit/modules/datalens-chartkit-custom-error/datalens-chartkit-custom-error';
import type {WidgetBase} from 'ui/libs/DatalensChartkit/types';

import type {ChartKitProps} from '../../../../../../ChartKitBase';
import type {LoadedChartInfo} from '../../../../../../types';

export type ExportResultType = {
    status: string;
    isCopyToClipboard?: boolean;
    data?: string;
    error?: AxiosError<Body>;
};

export type ExportParams = {
    format: ExportFormatsType;
    delValues: string | null;
    delNumbers: string | null;
    encoding: string | null;
};

export type ExportActionArgs = {
    loadedData: MenuLoadedData & {exportFilename: string};
    propsData: ChartKitProps<ChartsProps, ChartsData>;
    widget: Highcharts.Chart & LoadedChartInfo & WidgetBase;
    widgetDataRef: ChartWidgetDataRef;
    event: React.MouseEvent;
    error?: DatalensChartkitCustomError;
};

export type ExportChartArgs = {
    chartData: ExportActionArgs;
    params?: ExportParams;
    onExportLoading?: (isLoading: boolean) => void;
};
