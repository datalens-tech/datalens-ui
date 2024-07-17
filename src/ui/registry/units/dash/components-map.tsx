import type {DialogTextWidgetProps} from '../../../components/DialogTextWidget/DialogTextWidget';
import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DialogDashMetaProps} from './types/DialogDashMeta';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogDashMeta: makeDefaultEmpty<DialogDashMetaProps>(),

    // Old one
    DialogText: makeDefaultEmpty(),

    // New one
    DialogTextWidget: makeDefaultEmpty<DialogTextWidgetProps>(),
} as const;
