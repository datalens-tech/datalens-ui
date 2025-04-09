import React from 'react';

import {RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {ZoomMode, type ZoomModes} from '../../../../../../../shared/constants/wizard';

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

    const handleChangeInput = (value: string) => {
        onUpdate({mode: mode as ZoomModes, value: Number(value)});
    };

    return (
        <div className={b()}>
            <div className={b('row')}>
                <div className={b('title')}>{i18n('wizard', 'label_zoom')}</div>
                <RadioButton value={mode} onUpdate={handleUpdateMode}>
                    {RADIO_OPTIONS.map((item) => (
                        <RadioButton.Option key={item.value} value={item.value}>
                            {item.label}
                        </RadioButton.Option>
                    ))}
                </RadioButton>
            </div>
            {mode === ZoomMode.Manual && (
                <div className={b('row')}>
                    <div className={b('title')}>&nbsp;</div>
                    <TextInput
                        className={b('input')}
                        type="number"
                        pin="round-round"
                        size="m"
                        value={String(value ?? '')}
                        onUpdate={handleChangeInput}
                    />
                </div>
            )}
        </div>
    );
};
