import type {DialogCreateTextWidgetProps} from '../../../components/DialogCreateTextWidget/DialogCreateTextWidget';
import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DialogDashMetaProps} from './types/DialogDashMeta';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogDashMeta: makeDefaultEmpty<DialogDashMetaProps>(),

    // Old one
    DialogText: makeDefaultEmpty(),

    // New one
    DialogCreateTextWidget: makeDefaultEmpty<DialogCreateTextWidgetProps>(),
} as const;
