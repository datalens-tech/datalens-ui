import {color as d3Color} from 'd3-color';

import {type ColorParts} from './ColorPickerInput';

// Prevents browser warnings for empty\invalid values
export function normalizeColor(color?: string) {
    return color?.toUpperCase() || '';
}

export function isEmptyColor(color?: string): color is undefined {
    return color === '' || color === '#' || color === undefined;
}

export function colorMask(color?: string): string {
    if (isEmptyColor(color)) {
        return '';
    } else {
        return normalizeColor(`${color?.startsWith('#') ? '' : '#'}${color}`);
    }
}

export function getMaskedColor(color: ColorParts) {
    return {...color, solid: colorMask(color.solid)};
}

export function isValidColor(color: string) {
    return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color);
}

export function getColorParts(rawValue?: string): ColorParts {
    const d3ColorValue = rawValue ? d3Color(rawValue) : undefined;

    if (!d3ColorValue) {
        return {solid: '', opacity: 100};
    }

    const opacity = d3ColorValue.opacity * 100;
    const solid = normalizeColor(d3ColorValue.copy({opacity: 1}).formatHex());

    return {solid, opacity};
}

export function getResultColorFromParts(color: ColorParts): string {
    if (!color.solid || !d3Color(color.solid)) {
        return '';
    }

    const resultOpacity = color.opacity === null ? 1 : color.opacity / 100;
    const resultColor = d3Color(color.solid)?.copy({opacity: resultOpacity});
    const formattedColor =
        resultOpacity === 1 ? resultColor?.formatHex() : resultColor?.formatHex8();

    return formattedColor ?? '';
}
