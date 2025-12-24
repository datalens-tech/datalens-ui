import React from 'react';

import type {IconData, NumberInputProps} from '@gravity-ui/uikit';
import {Icon, NumberInput, Slider} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import './NumberInputWithSlider.scss';

const b = block('dl-number-input-with-slider');

export interface NumberInputWithSliderProps extends Omit<NumberInputProps, 'defaultValue'> {
    iconData?: IconData;
    defaultValue?: number;
}

export const NumberInputWithSlider = ({
    className,
    min,
    max,
    step,
    iconData,
    defaultValue,
    value,
    onUpdate,
    placeholder,
    ...numberInputProps
}: NumberInputWithSliderProps) => {
    return (
        <NumberInput
            className={b(null, className)}
            {...numberInputProps}
            min={min}
            max={max}
            step={step}
            value={value}
            onUpdate={onUpdate}
            hiddenControls
            hasClear
            placeholder={placeholder ?? defaultValue?.toString()}
            startContent={
                iconData ? <Icon size={16} data={iconData} className={b('icon')} /> : undefined
            }
            endContent={
                <Slider
                    className={b('slider')}
                    min={min}
                    max={max}
                    step={step}
                    value={value || defaultValue}
                    onUpdate={onUpdate}
                    size="s"
                    marks={0}
                />
            }
        />
    );
};
