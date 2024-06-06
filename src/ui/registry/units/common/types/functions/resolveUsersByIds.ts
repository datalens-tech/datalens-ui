import type {AnyAction} from 'redux';
import type {AppDispatch} from 'ui/store';

export type ResolveUsersByIds<T> = (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => void;
