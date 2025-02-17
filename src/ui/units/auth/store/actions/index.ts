import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import type {CommonAction} from './common';
import type {SigninAction} from './signin';

export type AuthAction = CommonAction | SigninAction;

export type AuthDispatch = ThunkDispatch<DatalensGlobalState, void, AuthAction>;
