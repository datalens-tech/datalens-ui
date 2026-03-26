import React from 'react';

import type {IconProps, NumberInputProps} from '@gravity-ui/uikit';
import {Icon, NumberInput, Slider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './NumberInputWithSlider.scss';

const b = block('dl-number-input-with-slider');

export type NumberInputWithSliderProps = Omit<
    NumberInputProps,
    'value' | 'onUpdate' | 'min' | 'max' | 'step' | 'startContent'
> & {
    value: number | null;
    onUpdate: (value: number | null) => void;
    min: number;
    max: number;
    step: number;
    icon?: IconProps['data'];
    sliderAriaLabel?: string;
};

export const NumberInputWithSlider = ({
    value,
    onUpdate,
    min,
    max,
    step,
    icon,
    sliderAriaLabel,
    className,
    ...numberInputProps
}: NumberInputWithSliderProps) => {
    return (
        <NumberInput
            className={b(null, className)}
            {...numberInputProps}
            value={value}
            onUpdate={onUpdate}
            min={min}
            max={max}
            step={step}
            hiddenControls
            hasClear
            startContent={icon ? <Icon size={16} data={icon} className={b('icon')} /> : undefined}
            endContent={
                <Slider
                    className={b('slider')}
                    min={min}
                    max={max}
                    step={step}
                    size="s"
                    marks={0}
                    value={value ?? min}
                    onUpdate={onUpdate}
                    aria-label={sliderAriaLabel}
                />
            }
        />
    );
};
