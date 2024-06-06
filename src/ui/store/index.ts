import type {ThunkAction, ThunkDispatch} from 'redux-thunk';
import type {DatalensGlobalState} from 'ui';
import type {AnyAction} from 'redux';

export * from './configure';
export * from './reducer-registry';

export type AppDispatch<T extends AnyAction = AnyAction, K = DatalensGlobalState> = ThunkDispatch<
    K,
    void,
    T
>;

export type AppThunkAction<ReturnType = void> = ThunkAction<
    ReturnType,
    DatalensGlobalState,
    void,
    AnyAction
>;
