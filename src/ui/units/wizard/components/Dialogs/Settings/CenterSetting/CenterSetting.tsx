import React from 'react';

import {RadioButton, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import {validateCoordinatesValue} from '../../../../../../../shared';
import {MapCenterMode, type MapCenterModes} from '../../../../../../../shared/constants/wizard';

import './CenterSetting.scss';

const RADIO_OPTIONS = [
    {
        value: MapCenterMode.Auto,
        label: i18n('wizard', 'label_auto'),
    },
    {
        value: MapCenterMode.Manual,
        label: i18n('wizard', 'label_manual'),
    },
];

type Props = {
    mode: MapCenterModes;
    value?: string | null;
    onUpdate: (settings: {mode: MapCenterModes; value?: string | null}) => void;
};

const b = block('center-setting');

export const CenterSetting = (props: Props) => {
    const {mode, value, onUpdate} = props;
    const inputValidationState = React.useMemo(() => {
        return value && !validateCoordinatesValue(value) ? 'invalid' : undefined;
    }, [value]);

    const handleUpdateMode = (mode: string) => {
        onUpdate({mode: mode as MapCenterModes, value});
    };

    const handleChangeInput = (value: string) => {
        onUpdate({mode: mode as MapCenterModes, value});
    };

    return (
        <div className={b()}>
            <div className={b('row')}>
                <div className={b('title')}>{i18n('wizard', 'label_center')}</div>
                <RadioButton value={mode} onUpdate={handleUpdateMode}>
                    {RADIO_OPTIONS.map((item) => (
                        <RadioButton.Option key={item.value} value={item.value}>
                            {item.label}
                        </RadioButton.Option>
                    ))}
                </RadioButton>
            </div>
            {mode === MapCenterMode.Manual && (
                <div className={b('row')}>
                    <div className={b('title')}>&nbsp;</div>
                    <TextInput
                        className={b('input')}
                        pin="round-round"
                        size="m"
                        value={value ?? ''}
                        onUpdate={handleChangeInput}
                        validationState={inputValidationState}
                        errorMessage={i18n('wizard', 'label_field-invalid')}
                    />
                </div>
            )}
        </div>
    );
};
