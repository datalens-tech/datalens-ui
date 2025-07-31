import {RECCOMMENDED_LINE_HEIGHT_MULTIPLIER, TITLE_DEFAULT_SIZES} from '@gravity-ui/dashkit';
import {type DashTitleSize} from 'shared';

import {HINT_SIZE, TITLE_PADDING_TOP} from './constants';

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

export const getTopOffsetBySize = (size: DashTitleSize) => {
    if (typeof size === 'object' && 'fontSize' in size) {
        return (
            (size.fontSize * RECCOMMENDED_LINE_HEIGHT_MULTIPLIER - HINT_SIZE) / 2 +
            TITLE_PADDING_TOP
        );
    }

    if (typeof size === 'string') {
        const fontStyles = TITLE_DEFAULT_SIZES[size];
        return (
            (parseInt(fontStyles.lineHeight ?? fontStyles.fontSize, 10) - HINT_SIZE) / 2 +
            TITLE_PADDING_TOP
        );
    }

    return TITLE_PADDING_TOP;
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
