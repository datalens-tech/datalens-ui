import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {AlternativeLoginOptionsProps} from './types/components/AlternativeLoginOptions';

export const authComponentsMap = {
    AlternativeLoginOptions: makeDefaultEmpty<AlternativeLoginOptionsProps>(),
} as const;
