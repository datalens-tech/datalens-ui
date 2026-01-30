import type {ChartKitProps} from 'ui/libs/DatalensChartkit/components/ChartKitBase/ChartKitBase';
import type {ChartsData, ChartsProps} from 'ui/libs/DatalensChartkit/modules/data-provider/charts';
import type {Widget} from 'ui/libs/DatalensChartkit/types';

export type DialogShareProps = {
    onClose: () => void;
    visible?: boolean;
    propsData: ChartKitProps<ChartsProps, ChartsData>;
    loadedData?: Widget & ChartsData;
    urlIdPrefix?: string;
    initialParams?: Record<string, number>;
    hasDefaultSize?: boolean;
    withLinkDescription?: boolean;
    withHideComments?: boolean;
    withSelectors?: boolean;
    withFederation?: boolean;
    withEmbedLink?: boolean;
    withHideMenu?: boolean;
    withCopyAndExitBtn?: boolean;
    currentTab?: string;
};
