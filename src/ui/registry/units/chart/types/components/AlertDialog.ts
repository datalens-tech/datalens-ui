import {ChartKitDataProvider} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import {WidgetData} from '../../../../../libs/DatalensChartkit/types';

export type AlertDialogProps = {
    data: WidgetData;
    onClose: () => void;
    chartsDataProvider: ChartKitDataProvider;
};
