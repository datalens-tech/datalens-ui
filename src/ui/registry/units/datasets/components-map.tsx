import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {CreateDashboardButtonProps} from './types/CreateDashboardButton';

export const datasetsComponentsMap = {
    CreateDashboardButton: makeDefaultEmpty<CreateDashboardButtonProps>(),
} as const;
