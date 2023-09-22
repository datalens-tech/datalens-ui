import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {FieldWrapper} from 'components/FieldWrapper/FieldWrapper';

import {i18n} from '../../../../../../../i18n';
import {DL} from '../../../../../../constants';

import './LimitInput.scss';

const b = block('dialog-settings-limit-input');
const MIN_ROW_LIMIT = 1;
const MAX_ROW_LIMIT = 100000;

interface LimitInputProps {
    onChange: (value: string) => void;
    setValid: (value: boolean) => void;
    text?: string;
    disabled: boolean;
}

const isLimitValid = (value?: number) => {
    if (!value) {
        return false;
    }

    return value >= MIN_ROW_LIMIT && value <= MAX_ROW_LIMIT;
};

const LimitInput: React.FC<LimitInputProps> = ({text, disabled, onChange, setValid}) => {
    const [error, setError] = React.useState('');

    const changeHandler = React.useCallback(
        (value: string) => {
            if (isLimitValid(Number(value))) {
                setError('');
                setValid(true);
            } else {
                setError(
                    i18n('wizard', 'label_limit-input-error', {
                        min: MIN_ROW_LIMIT,
                        max: new Intl.NumberFormat(DL.USER_LANG || 'ru').format(MAX_ROW_LIMIT),
                    }),
                );
                setValid(false);
            }

            onChange(value);
        },
        [onChange, setValid],
    );

    return (
        <div className={b('container')}>
            <span className={b('label')}>{i18n('wizard', 'label_limit')}</span>
            <FieldWrapper error={error}>
                <TextInput
                    className={b('text-input')}
                    type="number"
                    size="m"
                    value={text}
                    disabled={disabled}
                    onUpdate={changeHandler}
                />
            </FieldWrapper>
        </div>
    );
};

export default LimitInput;
