import {ChartKitOnLoadData} from '@gravity-ui/chartkit';

import {MarkupItem} from '../../../../../components/Markup';

export type MarkupWidgetData = {
    data: MarkupItem;
};

export type MarkupWidgetProps = {
    id: string;
    data: MarkupWidgetData;
    onLoad?: (data?: ChartKitOnLoadData<'markup'>) => void;
};
