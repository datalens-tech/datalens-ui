import {makeDefaultEmpty} from 'ui/registry/components/DefaultEmpty';

import type {AdditionalUsersFiltersProps} from './types/components/AdditionalUsersFilters';
import type {SigninProps} from './types/components/Signin';

export const authComponentsMap = {
    Signin: makeDefaultEmpty<SigninProps>(),
    AdditionalUsersFilters: makeDefaultEmpty<AdditionalUsersFiltersProps>(),
} as const;
