import type {ChartKitOnLoadData} from '@gravity-ui/chartkit';

import type {OnChangeData, TableWidget} from '../../../types';

export type TableWidgetProps = {
    id: string;
    data: TableWidget;
    onChange?: (
        data: OnChangeData,
        state: {forceUpdate: boolean},
        callExternalOnChange?: boolean,
        callChangeByClick?: boolean,
    ) => void;
    onLoad?: (data?: ChartKitOnLoadData<'table'>) => void;
    rowsRenderLimit?: number;
};
