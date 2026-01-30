import type moment from 'moment';
import type {compose} from 'redux';

import type {AvailableYMActions, DLGlobalData} from '../shared';

declare global {
    interface Window {
        sdk: unknown;
        moment: moment;
        DL: DLGlobalData;
        ym?: (
            counterId: string | number,
            action: AvailableYMActions,
            targetId: string,
            params?: Record<string, unknown>,
        ) => void;
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__: typeof compose;
        clipboardData: DataTransfer;
    }
}
