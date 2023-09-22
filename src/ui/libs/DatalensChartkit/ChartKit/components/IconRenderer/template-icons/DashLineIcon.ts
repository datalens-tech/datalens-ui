import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const DashLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="0 0 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#a)">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-5 2h-4V0h4v2zM9 2H1V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm10 0h-4V0h4v2z"
                fill="currentColor"
            />
        </g>
        <defs>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h260v2H0z" />
            </clipPath>
        </defs>
    </svg>`;
};
