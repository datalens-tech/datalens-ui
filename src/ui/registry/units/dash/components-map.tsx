import type {OwnProps as DashBodyProps} from 'ui/units/dash/containers/Body/Body';

import type {DialogTextWidgetProps} from '../../../components/DialogTextWidget/DialogTextWidget';
import {makeDefaultEmpty} from '../../components/DefaultEmpty';

import type {DashActionPanelAdditionalButtonsProps} from './types/DashActionPanelAdditionalButtons';
import type {DialogDashOtherSettingsPrependProps} from './types/DialogDashOtherSettingsPrepend';

export const dashComponentsMap = {
    DashSelectState: makeDefaultEmpty(),
    DashSelectStateDialog: makeDefaultEmpty(),
    DialogTextWidget: makeDefaultEmpty<DialogTextWidgetProps>(),
    DashBody: makeDefaultEmpty<DashBodyProps>(),
    DashBodyAdditionalControls: makeDefaultEmpty(),
    DialogDashOtherSettingsPrepend: makeDefaultEmpty<DialogDashOtherSettingsPrependProps>(),
    DashActionPanelAdditionalButtons: makeDefaultEmpty<DashActionPanelAdditionalButtonsProps>(),
} as const;
