import type {CommonIconProps} from '../types';
import {getParsedRect} from '../utils';

export const SolidLineIcon = ({width, height}: CommonIconProps) => {
    const {parsedWidth, parsedHeight} = getParsedRect({width, height});

    return `<svg
        width="${width}"
        height="${height}"
        fill="none"
        viewBox="0 2 ${parsedWidth} ${parsedHeight}"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path fillRule="evenodd" clipRule="evenodd" d="M38 4H0V2h38v2z" fill="currentColor" />
    </svg>`;
};
