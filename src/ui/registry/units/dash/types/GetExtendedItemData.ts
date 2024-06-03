import type {AnyAction} from 'redux';

import type {AppDispatch} from '../../../../store';
import type {SetItemDataArgs} from '../../../../units/dash/store/actions/dashTyped';

export type GetExtendedItemData = <T>(
    args: SetItemDataArgs,
) => (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => SetItemDataArgs;
