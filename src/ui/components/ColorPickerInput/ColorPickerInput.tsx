import React from 'react';

import type {InputControlSize} from '@gravity-ui/uikit';
import {Text, TextInput} from '@gravity-ui/uikit';
import {
    unstable_NumberInput as NumberInput,
    type unstable_NumberInputProps as NumberInputProps,
} from '@gravity-ui/uikit/unstable';
import block from 'bem-cn-lite';
import {color as d3Color} from 'd3-color';

import {
    colorMask,
    getColorParts,
    getMaskedColor,
    getResultColorFromParts,
    isEmptyColor,
    isValidColor,
    normalizeColor,
} from './utils';

import './ColorPickerInput.scss';

const b = block('color-picker-input');

const DEFAULT_COLOR = '#FFFFFF';

interface ColorPickerInputProps {
    required?: boolean;
    placeholder?: string;
    value?: string;
    size?: InputControlSize;
    hasClear?: boolean;
    hasOpacityInput?: boolean;
    autoFocus?: boolean;
    onUpdate: (value: string | null) => void;
    onValidChange?: (isValid: boolean) => void;
    className?: string;
}

export interface ColorParts {
    solid: string;
    opacity: number | null;
}

export function ColorPickerInput({
    required,
    size,
    placeholder,
    value,
    hasClear,
    hasOpacityInput,
    autoFocus,
    onUpdate,
    onValidChange,
    className,
}: ColorPickerInputProps) {
    const {solid: externalSolidColorPart} = getColorParts(value);
    const [stateValue, setStateValue] = React.useState<ColorParts>(getColorParts(colorMask(value)));
    const [isValid, setIsValid] = React.useState(true);
    const pickerRef = React.useRef(null);

    React.useEffect(() => {
        setStateValue((prevValue) => {
            if (
                getResultColorFromParts(prevValue) === getResultColorFromParts(getColorParts(value))
            ) {
                return prevValue;
            }

            return getMaskedColor(getColorParts(value));
        });
    }, [value]);

    const setColor = React.useCallback(
        (color: string) => {
            setStateValue((prevValue) => {
                let isValidValue = false;
                const maskedColor = colorMask(color);
                const opacity = prevValue.opacity === null ? 100 : prevValue.opacity;

                if (isEmptyColor(maskedColor)) {
                    onUpdate(null);
                    isValidValue = !required;
                } else if (isValidColor(maskedColor)) {
                    const valueWithOpacity = d3Color(maskedColor)
                        ?.copy({opacity: opacity / 100})
                        .formatHex8();
                    onUpdate(valueWithOpacity ?? null);
                    isValidValue = true;
                }
                setIsValid(isValidValue);
                onValidChange?.(isValidValue);

                return {...prevValue, solid: maskedColor, opacity};
            });
        },
        [onUpdate, onValidChange, required],
    );

    const handleOpacityChange = React.useCallback(
        (newOpacity: number | null) => {
            setStateValue((prevValue) => {
                const newState = {...prevValue, opacity: newOpacity};
                if (isValidColor(prevValue.solid)) {
                    onUpdate(getResultColorFromParts(newState));
                }
                return newState;
            });
        },
        [onUpdate],
    );

    const formattedPlaceholder = isValidColor(placeholder || '')
        ? normalizeColor(placeholder)
        : placeholder;

    return (
        <TextInput
            className={b(null, className)}
            size={size}
            value={normalizeColor(stateValue.solid)}
            placeholder={formattedPlaceholder ?? '#'}
            onUpdate={setColor}
            error={!isValid}
            hasClear={hasClear}
            autoFocus={autoFocus}
            startContent={
                <div
                    className={b('preview')}
                    style={
                        isValid
                            ? {
                                  background: `linear-gradient(90deg, ${externalSolidColorPart ?? 'transparent'} 50%, ${value ?? 'transparent'} 50%)`,
                              }
                            : {}
                    }
                    ref={pickerRef}
                >
                    <input
                        className={b('palette', {[`size-${size}`]: true})}
                        type="color"
                        value={externalSolidColorPart || DEFAULT_COLOR}
                        onChange={(e) => {
                            setColor(e.target.value);
                        }}
                    />
                </div>
            }
            unstable_endContent={
                hasOpacityInput ? (
                    <OpacityInput value={stateValue.opacity} onUpdate={handleOpacityChange} />
                ) : null
            }
        />
    );
}

function OpacityInput({value, onUpdate}: Pick<NumberInputProps, 'value' | 'onUpdate'>) {
    return (
        <NumberInput
            className={b('opacity-input')}
            view="clear"
            pin="brick-round"
            hiddenControls
            min={0}
            max={100}
            placeholder="100"
            endContent={
                <Text className={b('opacity-end-content')} color="hint">
                    %
                </Text>
            }
            value={value}
            onUpdate={onUpdate}
        />
    );
}

export default ColorPickerInput;
