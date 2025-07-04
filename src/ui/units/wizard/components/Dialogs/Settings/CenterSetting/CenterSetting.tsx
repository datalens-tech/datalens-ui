import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {SegmentedRadioGroup as RadioButton, TextInput} from '@gravity-ui/uikit';
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
    const {mode: centerMode, value: centerValue, onUpdate} = props;
    const inputValidationState = React.useMemo(() => {
        return centerValue && !validateCoordinatesValue(centerValue) ? 'invalid' : undefined;
    }, [centerValue]);

    const handleUpdateMode = (mode: string) => {
        onUpdate({mode: mode as MapCenterModes, value: centerValue});
    };

    const handleChangeInput = (value: string) => {
        onUpdate({mode: centerMode as MapCenterModes, value});
    };

    return (
        <FormRow className={b()} label={i18n('wizard', 'label_center')}>
            <RadioButton value={centerMode} onUpdate={handleUpdateMode}>
                {RADIO_OPTIONS.map((item) => (
                    <RadioButton.Option key={item.value} value={item.value}>
                        {item.label}
                    </RadioButton.Option>
                ))}
            </RadioButton>
            {centerMode === MapCenterMode.Manual && (
                <TextInput
                    className={b('input')}
                    pin="round-round"
                    size="m"
                    value={centerValue ?? ''}
                    onUpdate={handleChangeInput}
                    validationState={inputValidationState}
                    errorMessage={i18n('wizard', 'label_field-invalid')}
                />
            )}
        </FormRow>
    );
};
