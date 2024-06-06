import type {ConfigItem} from '@gravity-ui/dashkit';
import type {AnyAction} from 'redux';

import type {AppDispatch} from '../../../../store';

export type BeforeOpenDialogItemAction = <T>(
    data: ConfigItem,
) => (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => void;
