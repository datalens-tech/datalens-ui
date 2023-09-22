import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const DotLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="0 0 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g clipPath="url(#a)" fill="currentColor">
            <path d="M0 0h2v2H0zM8 0h2v2H8zM16 0h2v2h-2zM24 0h2v2h-2zM32 0h2v2h-2z" />
        </g>
        <defs>
            <clipPath id="a">
                <path fill="#fff" d="M0 0h259v2H0z" />
            </clipPath>
        </defs>
    </svg>`;
};
