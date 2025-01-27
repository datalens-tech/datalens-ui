import chroma from 'chroma-js';

import {type ColorParts} from './ColorPickerInput';

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

// Prevents browser warnings for empty\invalid values
export function sanitizeColor(color: string) {
    return normalizeColor(chroma(color).hex());
}

export function getMaskedColor(color: ColorParts) {
    return {...color, solid: colorMask(color.solid)};
}

export function isValidColor(color: string) {
    return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color);
}

export function getColorParts(rawValue?: string): ColorParts {
    const chromaValue = rawValue && chroma.valid(rawValue) ? chroma(rawValue) : undefined;

    if (!chromaValue) {
        return {solid: '', opacity: 100};
    }

    const opacity = chromaValue.alpha() * 100;
    const solid = normalizeColor(chromaValue.alpha(1).hex('rgb'));

    return {solid, opacity};
}

export function getResultColorFromParts(color: ColorParts): string {
    if (!color.solid || !chroma.valid(color.solid)) {
        return '';
    }

    return chroma(color.solid)
        .alpha(color.opacity === null ? 1 : color.opacity / 100)
        .hex();
}
