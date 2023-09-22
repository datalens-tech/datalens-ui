import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const ShortDotLineIcon = ({height, width}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `
    <svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="0 2 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M-2 4h-1V2h1v2zm4 0H0V2h2v2zm4 0H4V2h2v2zm4 0H8V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm4 0h-2V2h2v2zm3 0h-1V2h1v2z"
            fill="currentColor"
        />
    </svg>
`;
};
