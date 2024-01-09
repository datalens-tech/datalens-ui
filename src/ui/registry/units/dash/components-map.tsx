import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DialogDashMetaProps} from './types/DialogDashMeta';
import type {ExtendedValueSelectorProps} from './types/ExtendedValueSelector';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogDashMeta: makeDefaultEmpty<DialogDashMetaProps>(),
    DialogText: makeDefaultEmpty(),
    ExtendedValueSelector: makeDefaultEmpty<ExtendedValueSelectorProps>(),
} as const;
