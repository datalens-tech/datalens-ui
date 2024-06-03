import type {ChartKitDataProvider} from '../../../../../libs/DatalensChartkit/components/ChartKitBase/types';
import type {WidgetData} from '../../../../../libs/DatalensChartkit/types';

export type AlertDialogProps = {
    data: WidgetData;
    onClose: () => void;
    chartsDataProvider: ChartKitDataProvider;
};
