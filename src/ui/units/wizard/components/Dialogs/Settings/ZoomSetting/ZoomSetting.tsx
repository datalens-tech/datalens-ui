import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {RadioButton} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {ZoomMode, type ZoomModes} from '../../../../../../../shared/constants/wizard';
import {RangeInputPicker} from '../../../../../../components/common/RangeInputPicker';

import './ZoomSetting.scss';

const RADIO_OPTIONS = [
    {
        value: ZoomMode.Auto,
        label: i18n('wizard', 'label_auto'),
    },
    {
        value: ZoomMode.Manual,
        label: i18n('wizard', 'label_manual'),
    },
];

type Props = {
    mode: ZoomModes;
    value?: number | null;
    onUpdate: (settings: {mode: ZoomModes; value?: number | null}) => void;
};

const b = block('zoom-setting');

export const ZoomSetting = (props: Props) => {
    const {mode, value, onUpdate} = props;

    const handleUpdateMode = (mode: string) => {
        onUpdate({mode: mode as ZoomModes, value});
    };

    const handleChangeInput = (value: number) => {
        onUpdate({mode: mode as ZoomModes, value});
    };

    return (
        <FormRow className={b()} label={i18n('wizard', 'label_zoom')}>
            <RadioButton value={mode} onUpdate={handleUpdateMode}>
                {RADIO_OPTIONS.map((item) => (
                    <RadioButton.Option key={item.value} value={item.value}>
                        {item.label}
                    </RadioButton.Option>
                ))}
            </RadioButton>
            {mode === ZoomMode.Manual && (
                <RangeInputPicker
                    size="s"
                    value={value ?? 1}
                    minValue={1}
                    maxValue={21}
                    step={1}
                    onUpdate={handleChangeInput}
                    className={b('input')}
                />
            )}
        </FormRow>
    );
};
