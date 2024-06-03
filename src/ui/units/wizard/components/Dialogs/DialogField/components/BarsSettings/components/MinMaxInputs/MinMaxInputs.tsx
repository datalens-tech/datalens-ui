import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';

import type {ThresholdsValidationStatus} from '../../../../../../../typings';
import {validateThresholds} from '../../../../../../../utils/wizard';

import './MinMaxInputs.scss';

type MinMaxInputsProps = {
    min?: string;
    max?: string;
    mid?: string;
    disabled?: boolean;
    onUpdate: (args: Partial<{min: string; max: string}>) => void;
    validatePoints: '2-point' | '3-point';
    isMidEnabled?: boolean;
    onError: (error: boolean) => void;
    qa?: string;
    minQa?: string;
    maxQa?: string;
};

const b = block('min-max-inputs');

export const MinMaxInputs: React.FC<MinMaxInputsProps> = (props: MinMaxInputsProps) => {
    const {min, max, mid, onUpdate, disabled, validatePoints, onError, maxQa, minQa, qa} = props;

    const [validate, setValidate] = React.useState<ThresholdsValidationStatus | undefined>();

    React.useEffect(() => {
        if (validate?.right?.text || validate?.left?.text || validate?.middle?.text) {
            onError(true);
        } else {
            onError(false);
        }
    }, [onError, validate]);

    React.useEffect(() => {
        if (disabled) {
            setValidate(undefined);
        }
    }, [disabled]);

    const handleMinUpdate = (newMinValue: string) => {
        onUpdate({min: newMinValue});
        setValidate(
            validateThresholds({
                pointsToValidate: validatePoints,
                rightThreshold: max === '' ? undefined : max,
                leftThreshold: newMinValue === '' ? undefined : newMinValue,
                middleThreshold: mid === '' ? undefined : mid,
            }),
        );
    };

    const handleMaxUpdate = (newMaxValue: string) => {
        onUpdate({max: newMaxValue});
        setValidate(
            validateThresholds({
                pointsToValidate: validatePoints,
                rightThreshold: newMaxValue === '' ? undefined : newMaxValue,
                leftThreshold: min === '' ? undefined : min,
                middleThreshold: mid === '' ? undefined : mid,
            }),
        );
    };

    return (
        <div className={b()} data-qa={qa}>
            <TextInput
                qa={minQa}
                error={validate && validate.left && validate.left.text}
                className={b('input')}
                value={min}
                onUpdate={handleMinUpdate}
                disabled={disabled}
            />
            <span className={b('input-label')}>{i18n('wizard', 'label_short-min')}</span>
            <TextInput
                qa={maxQa}
                error={validate && validate.right && validate.right.text}
                className={b('input')}
                value={max}
                onUpdate={handleMaxUpdate}
                disabled={disabled}
            />
            <span className={b('input-label')}>{i18n('wizard', 'label_short-max')}</span>
        </div>
    );
};
