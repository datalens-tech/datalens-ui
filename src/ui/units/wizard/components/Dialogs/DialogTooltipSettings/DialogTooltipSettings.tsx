import React from 'react';

import {SquareLetterT} from '@gravity-ui/icons';
import {Dialog, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ServerTooltipConfig} from 'shared';

import DialogManager from '../../../../../components/DialogManager/DialogManager';
import {DialogRadioButtons} from '../components/DialogRadioButtons/DialogRadioButtons';
import {DialogRow} from '../components/DialogRow/DialogRow';

import './DialogTooltipSettings.scss';

const i18n = I18n.keyset('wizard');
const b = block('dialog-tooltip-settings');

const dialogRowCustomProps = {
    titleCustomWidth: '155px',
    rowCustomMarginBottom: '20px',
};

export type Props = {
    tooltipConfig?: ServerTooltipConfig;
    onApply: (tooltipConfig: ServerTooltipConfig) => void;
    onClose: () => void;
};

export type OpenDialogTooltipSettingsArgs = {
    id: typeof DIALOG_TOOLTIP_SETTINGS;
    props: Props;
};

type State = ServerTooltipConfig;
const defaultState: ServerTooltipConfig = {
    color: 'on',
    fieldTitle: 'on',
};

const colorRadioButtons = [
    {value: 'on', content: i18n('label_on')},
    {value: 'off', content: i18n('label_off')},
];

const fieldTitleRadioButtons = [
    {value: 'on', content: i18n('label_on')},
    {value: 'off', content: i18n('label_off')},
];

export const DialogTooltipSettings = (props: Props) => {
    const {onApply, onClose, tooltipConfig} = props;
    const [state, setState] = React.useState<State>({...defaultState, ...tooltipConfig});

    const handleApplySettings = () => {
        onApply(state);
    };

    return (
        <Dialog open={true} onClose={onClose}>
            <Dialog.Header
                insertBefore={
                    <div className={b('title-icon')}>
                        <Icon {...{data: SquareLetterT}} size={18} />
                    </div>
                }
                caption={i18n('section_tooltips')}
            />
            <Dialog.Body className={b()}>
                <DialogRow
                    {...dialogRowCustomProps}
                    title={i18n('label_color')}
                    setting={
                        <DialogRadioButtons
                            items={colorRadioButtons}
                            value={state.color}
                            onUpdate={(value) => {
                                setState({...state, color: value as ServerTooltipConfig['color']});
                            }}
                        />
                    }
                />
                <DialogRow
                    {...dialogRowCustomProps}
                    title={i18n('label_field-title')}
                    setting={
                        <DialogRadioButtons
                            items={fieldTitleRadioButtons}
                            value={state.fieldTitle}
                            onUpdate={(value) => {
                                setState({
                                    ...state,
                                    fieldTitle: value as ServerTooltipConfig['fieldTitle'],
                                });
                            }}
                        />
                    }
                />
            </Dialog.Body>
            <Dialog.Footer
                onClickButtonApply={handleApplySettings}
                textButtonApply={i18n('button_apply')}
                onClickButtonCancel={onClose}
                textButtonCancel={i18n('button_cancel')}
            />
        </Dialog>
    );
};

export const DIALOG_TOOLTIP_SETTINGS = Symbol('DIALOG_TOOLTIP_SETTINGS');
DialogManager.registerDialog(DIALOG_TOOLTIP_SETTINGS, DialogTooltipSettings);
