import {makeDefaultEmpty} from 'ui/registry/components/DefaultEmpty';

import type {SigninProps} from './types/components/Signin';

export const authComponentsMap = {
    Signin: makeDefaultEmpty<SigninProps>(),
} as const;
