import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {STEP_BUTTON_DIRECTION, StepButton} from './StepButton';

import './NumberInput.scss';

const b = block('number-input');

interface NumberInputProps {
    value: number;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    qa?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    max = Infinity,
    min = -Infinity,
    qa,
}) => {
    const [internalValue, setInternalValue] = React.useState<string>(String(value));

    React.useEffect(() => {
        setInternalValue(String(value));
    }, [value]);

    const commitValue = React.useCallback(
        (newValue: number) => {
            setInternalValue(String(newValue));
            onChange(newValue);
        },
        [onChange],
    );

    const clampAndCommit = React.useCallback(
        (delta = 0) => {
            const parsed = parseInt(internalValue, 10);
            const baseValue = Number.isNaN(parsed) ? value : parsed;
            const newValue = baseValue + delta;

            commitValue(Math.max(min, Math.min(max, newValue)));
        },
        [internalValue, min, max, commitValue, value],
    );

    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const relatedTarget = e.relatedTarget as HTMLElement | null;
            if (relatedTarget?.closest(`.${b('input-button')}`)) {
                return;
            }

            clampAndCommit();
        },
        [clampAndCommit],
    );

    const onKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                clampAndCommit();
            }
        },
        [clampAndCommit],
    );

    const onInput = React.useCallback((newValue: string) => {
        setInternalValue(newValue);
    }, []);

    const onPlus = React.useCallback(() => clampAndCommit(1), [clampAndCommit]);

    const onMinus = React.useCallback(() => clampAndCommit(-1), [clampAndCommit]);

    const memorizedInputAttrs: React.InputHTMLAttributes<HTMLInputElement> = React.useMemo(
        () => ({
            min: Number.isFinite(min) ? min : undefined,
            max: Number.isFinite(max) ? max : undefined,
            style: {textAlign: 'center'},
        }),
        [min, max],
    );

    const parsedInternal = parseInt(internalValue, 10);
    const isMinusDisabled = !Number.isNaN(parsedInternal) && parsedInternal <= min;
    const isPlusDisabled = !Number.isNaN(parsedInternal) && parsedInternal >= max;

    return (
        <div className={b({})}>
            <StepButton
                direction={STEP_BUTTON_DIRECTION.Minus}
                disabled={isMinusDisabled}
                onClick={onMinus}
            />
            <TextInput
                qa={qa}
                type="number"
                pin="brick-brick"
                controlProps={memorizedInputAttrs}
                value={internalValue}
                onBlur={onBlur}
                onUpdate={onInput}
                onKeyDown={onKeyDown}
                className={b('text-input')}
            />
            <StepButton
                direction={STEP_BUTTON_DIRECTION.Plus}
                disabled={isPlusDisabled}
                onClick={onPlus}
            />
        </div>
    );
};

export default NumberInput;
