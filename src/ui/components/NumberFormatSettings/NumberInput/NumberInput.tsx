import React from 'react';

import {Button, TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './NumberInput.scss';

interface NumberInputProps {
    value: number;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    qa?: string;
    className?: string;
    buttonClassName?: string;
    inputClassName?: string;
}

const b = block('wizard-number-input');

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    max = Infinity,
    min = -Infinity,
    className,
    buttonClassName,
    inputClassName,
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

    const clampAndCommit = React.useCallback(() => {
        const parsed = parseInt(internalValue, 10);
        if (Number.isNaN(parsed)) {
            commitValue(value);
        } else if (parsed < min) {
            commitValue(min);
        } else if (parsed > max) {
            commitValue(max);
        } else {
            commitValue(parsed);
        }
    }, [internalValue, min, max, commitValue, value]);

    const onBlur = React.useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const relatedTarget = e.relatedTarget as HTMLElement | null;
            // Skip clampAndCommit if focus moved to +/- buttons
            if (relatedTarget?.closest(`.${b('button')}`)) {
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

    const onPlus = React.useCallback(() => {
        const parsed = parseInt(internalValue, 10);
        if (Number.isNaN(parsed)) {
            commitValue(value + 1 <= max ? value + 1 : max);
        } else if (parsed < min) {
            commitValue(min);
        } else if (parsed >= max) {
            commitValue(max);
        } else {
            commitValue(parsed + 1);
        }
    }, [internalValue, min, max, commitValue, value]);

    const onMinus = React.useCallback(() => {
        const parsed = parseInt(internalValue, 10);
        if (Number.isNaN(parsed)) {
            commitValue(value - 1 >= min ? value - 1 : min);
        } else if (parsed > max) {
            commitValue(max);
        } else if (parsed <= min) {
            commitValue(min);
        } else {
            commitValue(parsed - 1);
        }
    }, [internalValue, min, max, commitValue, value]);

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
        <div className={b({}, className)}>
            <Button
                className={b('button', buttonClassName)}
                view="outlined"
                pin="round-brick"
                disabled={isMinusDisabled}
                onClick={onMinus}
            >
                -
            </Button>
            <TextInput
                qa={qa}
                type="number"
                pin="brick-brick"
                controlProps={memorizedInputAttrs}
                value={internalValue}
                onBlur={onBlur}
                onUpdate={onInput}
                onKeyDown={onKeyDown}
                className={b('text-input', inputClassName)}
            />
            <Button
                className={b('button', buttonClassName)}
                view="outlined"
                pin="brick-round"
                disabled={isPlusDisabled}
                onClick={onPlus}
            >
                +
            </Button>
        </div>
    );
};

export default NumberInput;
