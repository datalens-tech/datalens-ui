import React from 'react';

import block from 'bem-cn-lite';

import './HoverRadioButton.scss';

type RadioProps = {
    text: string;
    value: string;
    chosen: boolean;
    onMouseEnter: (value: string) => void;
    onMouseLeave: (value: string) => void;
    onClick: (value: string) => void;
};

const b = block('hover-radio-button');

const Radio = React.memo(
    ({text, value, chosen, onMouseEnter, onMouseLeave, onClick}: RadioProps) => {
        return (
            <div
                className={b('radio', {chosen})}
                onMouseEnter={() => onMouseEnter(value)}
                onMouseLeave={() => onMouseLeave(value)}
                onClick={() => onClick(value)}
            >
                {text}
            </div>
        );
    },
);

Radio.displayName = 'Radio';

type HoverRadioButtonProps = {
    value?: string;
    values: string[];
    radioText: string[];
    onChange?: (value?: string) => void;
};

const HoverRadioButton = React.memo(
    ({value, values, radioText, onChange}: HoverRadioButtonProps) => {
        const [currentValue, setCurrentValue] = React.useState(value);

        const onMouseEnter = React.useCallback(
            (newValue: string) => {
                if (currentValue !== newValue) {
                    onChange?.(newValue);
                }
            },
            [currentValue, onChange],
        );

        const onMouseLeave = React.useCallback(
            (newValue: string) => {
                if (currentValue !== newValue) {
                    onChange?.(currentValue);
                }
            },
            [currentValue, onChange],
        );

        const onClick = React.useCallback(
            (newValue: string) => {
                if (currentValue !== newValue) {
                    setCurrentValue(newValue);
                    onChange?.(newValue);
                }
            },
            [currentValue, onChange],
        );

        return (
            <div className={b()}>
                {values.map((itemValue, i) => (
                    <Radio
                        key={itemValue}
                        value={itemValue}
                        text={radioText[i]}
                        chosen={itemValue === currentValue}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onClick={onClick}
                    />
                ))}
            </div>
        );
    },
);

HoverRadioButton.displayName = 'HoverRadioButton';

export default HoverRadioButton;
