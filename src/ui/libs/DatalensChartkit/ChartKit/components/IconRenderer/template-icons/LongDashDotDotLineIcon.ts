import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const LongDashDotDotLineIcon = ({width, height}: CommonIconProps) => {
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
            d="M30 2h16V0H30v2zM-8 2H8V0H-8v2zM22 2h2V0h-2v2zM14 2h2V0h-2v2z"
            fill="currentColor"
        />
    </svg>`;
};
