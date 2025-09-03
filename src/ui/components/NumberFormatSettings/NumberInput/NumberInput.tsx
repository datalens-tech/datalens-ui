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
}

const b = block('wizard-number-input');
const DEFAULT_VALUE = 0;

const NumberInput: React.FC<NumberInputProps> = ({
    value,
    onChange,
    max = Infinity,
    min = -Infinity,
    qa,
}) => {
    const onBlur = React.useCallback(() => {
        if (Number.isNaN(value)) {
            onChange(DEFAULT_VALUE);
        }
    }, [onChange, value]);

    const onInput = React.useCallback((newValue) => onChange(parseInt(newValue, 10)), [onChange]);

    const onPlus = React.useCallback(() => {
        const newValue = Number.isNaN(value) ? DEFAULT_VALUE : Math.min(value + 1, max);
        onChange(newValue);
    }, [max, onChange, value]);

    const onMinus = React.useCallback(() => {
        const newValue = Number.isNaN(value) ? DEFAULT_VALUE : Math.max(value - 1, min);
        onChange(newValue);
    }, [min, onChange, value]);

    const memorizedInputAttrs = React.useMemo(() => ({min, max}), [min, max]);

    return (
        <div className={b()}>
            <Button pin="round-brick" onClick={onMinus}>
                -
            </Button>
            <TextInput
                qa={qa}
                type="number"
                pin="brick-brick"
                controlProps={memorizedInputAttrs}
                value={String(value)}
                onBlur={onBlur}
                onUpdate={onInput}
            />
            <Button pin="brick-round" onClick={onPlus}>
                +
            </Button>
        </div>
    );
};

export default NumberInput;
