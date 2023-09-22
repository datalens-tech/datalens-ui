import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import {DialogDashMetaProps} from './types/DialogDashMeta';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogDashMeta: makeDefaultEmpty<DialogDashMetaProps>(),
    DialogText: makeDefaultEmpty(),
} as const;
