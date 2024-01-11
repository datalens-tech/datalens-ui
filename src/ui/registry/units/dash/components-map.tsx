import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DialogDashMetaProps} from './types/DialogDashMeta';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogDashMeta: makeDefaultEmpty<DialogDashMetaProps>(),
    DialogText: makeDefaultEmpty(),
} as const;
