import React from 'react';
import {CustomSignin} from 'ui/units/auth/components/Signin/CustomSignin';
import type {CustomSigninProps} from 'ui/registry/units/auth/types/components/CustomSignin';

const CustomAuthPage = ({setToken}: CustomSigninProps) => {
    return <CustomSignin setToken={setToken} />;
};

export default CustomAuthPage;
