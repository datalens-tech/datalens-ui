import React from 'react';

import type {CommonIconProps} from '../types';

const DashDotLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
    <svg
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 38 2"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30 2h8V0h-8v2zM8 2h8V0H8v2zM22 2h2V0h-2v2zM0 2h2V0H0v2z"
            fill="currentColor"
        />
    </svg>
);

export default DashDotLineIcon;
