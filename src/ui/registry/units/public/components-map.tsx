import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {HeaderProps} from './types/components/Header';

export const publicComponentsMap = {
    Header: makeDefaultEmpty<HeaderProps>(),
} as const;
