import React from 'react';

import type {
    InputControlSize,
    InputControlSize,
    NumberInputProps,
    RealTheme,
} from '@gravity-ui/uikit';
import {NumberInput, Text, TextInput, ThemeProvider} from '@gravity-ui/uikit';
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

const DEFAULT_PREVIEW_PARAMS = {
    solidColorPart: DEFAULT_COLOR,
    styles: {},
};

const generatePreviewGradient = (color = 'transparent', colorWithOpacity = 'transparent') => {
    return `linear-gradient(90deg, ${color} 50%, ${colorWithOpacity} 50%)`;
};

interface ColorPickerInputProps {
    required?: boolean;
    placeholder?: string;
    showPlaceholder?: boolean;
    value?: string;
    size?: InputControlSize;
    hasClear?: boolean;
    hasOpacityInput?: boolean;
    autoFocus?: boolean;
    onUpdate: (value: string | null) => void;
    onValidChange?: (isValid: boolean) => void;
    theme?: RealTheme;
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
    showPlaceholder,
    value,
    hasClear,
    hasOpacityInput,
    autoFocus,
    onUpdate,
    onValidChange,
    theme,
    className,
}: ColorPickerInputProps) {
    const [stateValue, setStateValue] = React.useState<ColorParts>(getColorParts(colorMask(value)));
    const [isValid, setIsValid] = React.useState(true);
    const pickerRef = React.useRef(null);

    const renderParams = React.useMemo(() => {
        if (!isValid) {
            return DEFAULT_PREVIEW_PARAMS;
        }

        const {solid: solidColorPart} = getColorParts(value);
        if (!solidColorPart) {
            if (showPlaceholder && placeholder) {
                const {solid: placeholderSolidColorPart} = getColorParts(placeholder);

                return {
                    solidColorPart: placeholderSolidColorPart,
                    styles: {
                        background: generatePreviewGradient(placeholderSolidColorPart, placeholder),
                    },
                };
            } else {
                return DEFAULT_PREVIEW_PARAMS;
            }
        }

        return {
            solidColorPart,
            styles: {
                background: generatePreviewGradient(solidColorPart, value),
            },
        };
    }, [value, isValid, placeholder, showPlaceholder]);

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
            let isValidValue = false;
            const maskedColor = colorMask(color);
            const opacity = stateValue.opacity === null ? 100 : stateValue.opacity;

            if (isEmptyColor(maskedColor)) {
                onUpdate(null);
                isValidValue = !required;
            } else if (isValidColor(maskedColor)) {
                if (hasOpacityInput) {
                    const valueWithOpacity = d3Color(maskedColor)
                        ?.copy({opacity: opacity / 100})
                        .formatHex8()
                        .toLocaleUpperCase();

                    onUpdate(valueWithOpacity ?? null);
                } else {
                    onUpdate(maskedColor?.toLocaleUpperCase() ?? null);
                }

                isValidValue = true;
            }

            setIsValid(isValidValue);
            onValidChange?.(isValidValue);
            setStateValue({...stateValue, solid: maskedColor, opacity});
        },
        [onUpdate, onValidChange, stateValue, required, hasOpacityInput],
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

    const previewContent = (
        <div className={b('preview')} style={renderParams.styles} ref={pickerRef}>
            <input
                className={b('palette', {[`size-${size}`]: true})}
                type="color"
                value={renderParams.solidColorPart}
                onChange={(e) => {
                    setColor(e.target.value);
                }}
            />
        </div>
    );

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
                <div className={b('preview-container')}>
                    {theme ? (
                        <ThemeProvider theme={theme} scoped rootClassName={b('theme')}>
                            {previewContent}
                        </ThemeProvider>
                    ) : (
                        previewContent
                    )}
                </div>
            }
            endContent={
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
