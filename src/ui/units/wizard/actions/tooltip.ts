import type {ServerTooltipConfig} from 'shared';

import {closeDialog, openDialog} from '../../../store/actions/dialog';
import {DIALOG_TOOLTIP_SETTINGS} from '../components/Dialogs/DialogTooltipSettings/DialogTooltipSettings';
import type {OpenDialogTooltipSettingsArgs} from '../components/Dialogs/DialogTooltipSettings/DialogTooltipSettings';
import type {WizardDispatch} from '../reducers';

import {updatePreviewAndClientChartsConfig} from './preview';
import {setTooltipConfig} from './visualization';

type Args = Pick<OpenDialogTooltipSettingsArgs['props'], 'onApply' | 'tooltipConfig'>;

export function openTooltipSettingsDialog({onApply, tooltipConfig}: Args) {
    return function (dispatch: WizardDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_TOOLTIP_SETTINGS,
                props: {
                    tooltipConfig,
                    onApply: onApply,
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    };
}

export function applyTooltipSettings(tooltipConfig: ServerTooltipConfig) {
    return function (dispatch: WizardDispatch) {
        dispatch(setTooltipConfig({tooltipConfig}));
        dispatch(closeDialog());

        dispatch(updatePreviewAndClientChartsConfig({}));
    };
}
