import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const LongDashDotLineIcon = ({height, width}: CommonIconProps) => {
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
            d="M26 2h16V0H26v2zM-4 2h16V0H-4v2zM18 2h2V0h-2v2z"
            fill="currentColor"
        />
    </svg>`;
};
