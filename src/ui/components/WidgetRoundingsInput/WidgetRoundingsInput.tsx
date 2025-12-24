import React from 'react';

import {SquareDashed} from '@gravity-ui/icons';
import block from 'bem-cn-lite';

import {
    DASH_BORDER_RADIUS_STEP,
    MAX_DASH_BORDER_RADIUS,
    MIN_DASH_BORDER_RADIUS,
} from '../DashKit/constants';
import {
    NumberInputWithSlider,
    type NumberInputWithSliderProps,
} from '../NumberInputWithSlider/NumberInputWithSlider';

import './WidgetRoundingsInput.scss';

const b = block('dl-widget-roundings-input');

type WidgetRoundingsInputProps = Omit<
    NumberInputWithSliderProps,
    'value' | 'onUpdate' | 'min' | 'max' | 'step'
> & {
    value: number | undefined;
    onUpdate: (value: number | undefined) => void;
};

export function WidgetRoundingsInput({
    value,
    onUpdate,
    ...numberInputProps
}: WidgetRoundingsInputProps) {
    const valueNormalized = typeof value === 'number' ? value : null;
    const onUpdateNormalized = (v: number | null) => {
        onUpdate(typeof v === 'number' ? v : undefined);
    };

    return (
        <NumberInputWithSlider
            className={b()}
            value={valueNormalized ?? MIN_DASH_BORDER_RADIUS}
            onUpdate={onUpdateNormalized}
            min={MIN_DASH_BORDER_RADIUS}
            max={MAX_DASH_BORDER_RADIUS}
            step={DASH_BORDER_RADIUS_STEP}
            iconData={SquareDashed}
            {...numberInputProps}
        />
    );
}
