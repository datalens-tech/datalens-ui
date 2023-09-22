import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const LongDashLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="2 2 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g fill="currentColor">
            <path d="M0 2h16v2H0zM24 2h16v2H24z" />
        </g>
    </svg>`;
};
