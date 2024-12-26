import React from 'react';
import {reducerRegistry} from '../../../store';
import {AuthPage as AuthPageContainer} from '../../../units/auth/components/AuthPage/AuthPage';
import {reducer} from '../../../units/auth/store/reducers';

reducerRegistry.register({auth: reducer});

const AuthPage = () => <AuthPageContainer />;

export default AuthPage;
