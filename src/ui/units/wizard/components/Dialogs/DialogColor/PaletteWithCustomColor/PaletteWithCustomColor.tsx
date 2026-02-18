import React from 'react';

import block from 'bem-cn-lite';
import {DialogColorQa} from 'shared';
import ColorPickerInput from 'ui/components/ColorPickerInput/ColorPickerInput';
import {isHexColor} from 'ui/components/ColorPickerInput/utils';
import {PALETTE_DEFAULT_COLOR} from 'ui/constants';
import {PaletteTypes} from 'ui/units/wizard/constants';

import Palette from '../../../Palette/Palette';

import './PaletteWithCustomColor.scss';

interface PaletteWithCustomColorProps {
    colorsList: string[];
    onPaletteItemClick: (color: string, index?: number) => void;
    currentMountedColor?: string | null;
    selectedValue?: string | null;
    className?: string;
    palleteItemQa?: string;
}

const b = block('palette-with-custom-color');

export function PaletteWithCustomColor({
    onPaletteItemClick,
    currentMountedColor,
    colorsList,
    selectedValue,
    className,
    palleteItemQa,
}: PaletteWithCustomColorProps) {
    const isCustomColorSelected = isHexColor(currentMountedColor);
    const currentColorHex = isCustomColorSelected
        ? currentMountedColor
        : colorsList[Number(currentMountedColor)];
    // fallback to first color if current color is 'auto'
    const customColorValue = currentColorHex ?? colorsList[0];

    return (
        <div className={b({}, className)}>
            <Palette
                paletteType={PaletteTypes.Colors}
                onPaletteItemClick={onPaletteItemClick}
                isSelectedItem={(color, index) => {
                    if (isCustomColorSelected) {
                        return false;
                    }

                    const colorValue = currentMountedColor || PALETTE_DEFAULT_COLOR;

                    if (colorValue === String(index)) {
                        return true;
                    }

                    return color === colorValue;
                }}
                isDefaultItem={(color) => color === PALETTE_DEFAULT_COLOR}
                palette={colorsList}
                customColor={{
                    enabled: true,
                    selected: isCustomColorSelected,
                    onSelect: () => onPaletteItemClick(customColorValue),
                    qa: DialogColorQa.CustomColorButton,
                }}
                palleteItemQa={palleteItemQa}
            />
            <div className={b('color-input-wrapper', {visible: isCustomColorSelected})}>
                <ColorPickerInput
                    required
                    // reset invalid state when selected value changes
                    key={selectedValue}
                    hasOpacityInput
                    value={customColorValue}
                    size="l"
                    onUpdate={(colorHex) => colorHex !== null && onPaletteItemClick(colorHex)}
                    qa={DialogColorQa.CustomColorInput}
                />
            </div>
        </div>
    );
}

export function stripPaletteIndexColors(
    mountedColors: Record<string, string>,
): Record<string, string> {
    const newMountedColors: Record<string, string> = {};

    for (const key in mountedColors) {
        if (isHexColor(mountedColors[key])) {
            newMountedColors[key] = mountedColors[key];
        }
    }

    return newMountedColors;
}
