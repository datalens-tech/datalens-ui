import type {AnyAction} from 'redux';

import type {AppDispatch} from '../../../../store';
import type {SetItemDataItem} from '../../../../units/dash/store/actions/dashTyped';

export type GetExtendedItemData = <T>(
    args: SetItemDataItem,
) => (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => SetItemDataItem;
