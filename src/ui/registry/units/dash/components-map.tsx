import type {DialogTextWidgetProps} from '../../../components/DialogTextWidget/DialogTextWidget';
import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DialogDashOtherSettingsPrependProps} from './types/DialogDashOtherSettingsPrepend';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogTextWidget: makeDefaultEmpty<DialogTextWidgetProps>(),
    DashBodyAdditionalControls: makeDefaultEmpty(),
    DialogDashOtherSettingsPrepend: makeDefaultEmpty<DialogDashOtherSettingsPrependProps>(),
} as const;
