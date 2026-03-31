import React from 'react';

import {SquareDashed} from '@gravity-ui/icons';
import type {NumberInputProps} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {
    DASH_BORDER_RADIUS_STEP,
    MAX_DASH_BORDER_RADIUS,
    MIN_DASH_BORDER_RADIUS,
} from '../DashKit/constants';
import {NumberInputWithSlider} from '../NumberInputWithSlider/NumberInputWithSlider';

import './WidgetRoundingsInput.scss';

const b = block('dl-widget-roundings-input');

export type WidgetRoundingsInputProps = Omit<
    NumberInputProps,
    'value' | 'onUpdate' | 'min' | 'max' | 'step'
> & {
    value: number | undefined;
    onUpdate: (value: number | undefined) => void;
    sliderAriaLabel?: string;
};

export const WidgetRoundingsInput = ({
    value,
    onUpdate,
    sliderAriaLabel,
    ...numberInputProps
}: WidgetRoundingsInputProps) => {
    const valueNormalized = typeof value === 'number' ? value : null;
    const onUpdateNormalized = (v: number | null) => {
        onUpdate(typeof v === 'number' ? v : undefined);
    };

    return (
        <NumberInputWithSlider
            className={b()}
            {...numberInputProps}
            value={valueNormalized}
            onUpdate={onUpdateNormalized}
            min={MIN_DASH_BORDER_RADIUS}
            max={MAX_DASH_BORDER_RADIUS}
            step={DASH_BORDER_RADIUS_STEP}
            icon={SquareDashed}
            sliderAriaLabel={sliderAriaLabel}
        />
    );
};
