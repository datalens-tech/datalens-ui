import {ChartKitProps} from '@gravity-ui/chartkit';

import {MarkupItem} from '../../../../../components/Markup';

export type MarkupWidgetData = {
    data: MarkupItem;
};

export type MarkupWidgetProps = ChartKitProps<'markup'>;
