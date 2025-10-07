import React from 'react';
import type {AuthPageProps} from '../../../units/auth/components/AuthPage/AuthPage';
import {AuthPage as AuthPageContainer} from '../../../units/auth/components/AuthPage/AuthPage';

const AuthPage = (props: AuthPageProps) => <AuthPageContainer {...props} />;

export default AuthPage;
