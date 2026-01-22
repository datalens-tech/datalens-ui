import React from 'react';

import {Popup} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {computeColorFromToken} from 'ui/utils/widgets/colors';

import {
    ColorPickerInput,
    type ColorPickerInputProps,
} from '../../../../../../components/ColorPickerInput/ColorPickerInput';
import {ColorPalette} from '../ColorPalette/ColorPalette';

import './ColorPickerInputWithPreset.scss';

const b = block('color-picker-input-with-preset');

export interface ColorPickerInputWithPresetProps extends ColorPickerInputProps {
    mainPresetOptions?: string[];
    paletteOptions?: string[];
}

export function ColorPickerInputWithPreset({
    mainPresetOptions,
    paletteOptions,
    value,
    onUpdate,
    onBlur,
    theme,
    ...colorPickerInputProps
}: ColorPickerInputWithPresetProps) {
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleSelectColor = React.useCallback(
        (color: string) => {
            const hexColor = computeColorFromToken(color);
            onUpdate(hexColor || null);
            setIsPopupOpen(false);
        },
        [onUpdate],
    );

    const handleFocus = React.useCallback(() => {
        setIsPopupOpen(true);
    }, []);

    const handleClosePopup = React.useCallback((open: boolean) => {
        if (!open) {
            setIsPopupOpen(false);
        }
    }, []);

    if (!mainPresetOptions?.length && !paletteOptions?.length) {
        return (
            <ColorPickerInput
                {...colorPickerInputProps}
                value={value}
                onUpdate={onUpdate}
                onBlur={onBlur}
                theme={theme}
            />
        );
    }

    return (
        <React.Fragment>
            <ColorPickerInput
                {...colorPickerInputProps}
                value={value}
                onUpdate={onUpdate}
                theme={theme}
                onFocus={handleFocus}
                onBlur={onBlur}
                ref={inputRef}
            />
            <Popup
                open={isPopupOpen}
                anchorElement={inputRef.current}
                hasArrow
                onOpenChange={handleClosePopup}
                className={b('popup')}
            >
                <ColorPalette
                    onSelect={handleSelectColor}
                    onBlur={onBlur}
                    selectedColor={value || ''}
                    mainPresetOptions={mainPresetOptions || []}
                    paletteOptions={paletteOptions || []}
                    theme={theme}
                    paletteColumns={5}
                    showItemBorder
                />
            </Popup>
        </React.Fragment>
    );
}

export default ColorPickerInputWithPreset;
