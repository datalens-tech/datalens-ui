import type {DatalensGlobalState} from 'index';
import type {ThunkDispatch} from 'redux-thunk';

import type {CommonAction} from './common';
import type {SigninAction} from './signin';
import type {SignupAction} from './signup';

export type AuthAction = CommonAction | SigninAction | SignupAction;

export type AuthDispatch = ThunkDispatch<DatalensGlobalState, void, AuthAction>;
