import type {AnyAction} from 'redux';

import type {AppDispatch} from '../../../../store';

export type BeforeCloseDialogItemAction = <T>() => (
    dispatch: AppDispatch<AnyAction, T>,
    getState: () => T,
) => void;
