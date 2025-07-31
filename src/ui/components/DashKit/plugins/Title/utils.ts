import {RECCOMMENDED_LINE_HEIGHT_MULTIPLIER, TITLE_DEFAULT_SIZES} from '@gravity-ui/dashkit';
import {DashTabItemTitleSizes, type DashTitleSize} from 'shared';

import {HINT_SIZE, TITLE_WITH_BG_COLOR_PADDING_TOP} from './constants';

export const getFontStyleBySize = (size: DashTitleSize) => {
    if (typeof size === 'object' && 'fontSize' in size) {
        return {
            fontSize: size.fontSize + 'px',
            lineHeight: RECCOMMENDED_LINE_HEIGHT_MULTIPLIER,
        };
    }

    if (typeof size === 'string') {
        return TITLE_DEFAULT_SIZES[size];
    }

    return {};
};

export const getTopOffsetBySize = (size: DashTitleSize, showBgColor: boolean) => {
    const defaultPadding = showBgColor ? TITLE_WITH_BG_COLOR_PADDING_TOP : 0;

    if (typeof size === 'string') {
        const fontStyles = TITLE_DEFAULT_SIZES[size];
        const lineHeight = fontStyles.lineHeight
            ? parseInt(fontStyles.lineHeight, 10)
            : parseInt(fontStyles.fontSize, 10) * RECCOMMENDED_LINE_HEIGHT_MULTIPLIER;

        return (lineHeight - HINT_SIZE) / 2 + defaultPadding;
    }

    const lineHeight = size.fontSize * RECCOMMENDED_LINE_HEIGHT_MULTIPLIER;

    return (lineHeight - HINT_SIZE) / 2 + defaultPadding;
};

/* eslint-disable no-param-reassign */
export const isTitleOverflowed = (element: HTMLDivElement, extraElements: HTMLDivElement) => {
    const originalWhiteSpace = element.style.whiteSpace;
    element.style.whiteSpace = 'nowrap';

    const originalPosition = extraElements.style.position;
    extraElements.style.position = 'static';

    const isOverflowed = element.scrollWidth > element.offsetWidth;

    element.style.whiteSpace = originalWhiteSpace;
    extraElements.style.position = originalPosition;

    return isOverflowed;
};
/* eslint-enable no-param-reassign */

export const getHelpIconSizeByTitleSize = (size: DashTitleSize) => {
    // from uikit
    const ICON_SIZE_MAP = [
        ['xl', 20],
        ['l', 18],
        ['m', 16],
        ['s', 14],
    ] as const;

    if (typeof size === 'string') {
        return size === DashTabItemTitleSizes.XS ? 's' : size;
    }

    const fontSize = size.fontSize;

    for (const [key, value] of ICON_SIZE_MAP) {
        if (fontSize >= value) {
            return key;
        }
    }

    return 'm';
};
