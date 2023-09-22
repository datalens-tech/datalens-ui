import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const ShortDashDotDotLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="0 0 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32 2h6V0h-6v2zM16 2h6V0h-6v2zM28 2h2V0h-2v2zM24 2h2V0h-2v2zM0 2h6V0H0v2zM12 2h2V0h-2v2zM8 2h2V0H8v2z"
            fill="currentColor"
        />
    </svg>`;
};
