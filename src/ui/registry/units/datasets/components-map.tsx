import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {AdditionalDatasetActionsProps} from './types/components/AdditionalDatasetActions';

export const datasetsComponentsMap = {
    AdditionalDatasetActions: makeDefaultEmpty<AdditionalDatasetActionsProps>(),
} as const;
