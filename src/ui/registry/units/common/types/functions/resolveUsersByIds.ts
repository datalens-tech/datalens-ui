import {AnyAction} from 'redux';
import {AppDispatch} from 'ui/store';

export type ResolveUsersByIds<T> = (dispatch: AppDispatch<AnyAction, T>, getState: () => T) => void;
