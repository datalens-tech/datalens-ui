import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const ShortDashLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="-2 2 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-4 4h-3V2h3v2zm8 0h-6V2h6v2zm8 0H6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm8 0h-6V2h6v2zm5 0h-3V2h3v2z"
            fill="currentColor"
        />
    </svg>`;
};
