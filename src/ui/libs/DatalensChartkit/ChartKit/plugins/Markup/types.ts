import type {ChartKitProps} from '@gravity-ui/chartkit';

import type {MarkupItem} from '../../../../../../shared';

export type MarkupWidgetData = {
    data: {
        value: MarkupItem;
    };
};

export type MarkupWidgetProps = ChartKitProps<'markup'>;
