import React from 'react';

import type {CommonIconProps} from '../types';

const DotLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
    <svg
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 38 2"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g fill="currentColor">
            <path d="M0 0h2v2H0zM8 0h2v2H8zM16 0h2v2h-2zM24 0h2v2h-2zM32 0h2v2h-2z" />
        </g>
    </svg>
);

export default DotLineIcon;
