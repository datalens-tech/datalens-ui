import React from 'react';

import type {CommonIconProps} from '../types';

const LongDashDotDotLineIcon: React.FC<CommonIconProps> = ({width, height}: CommonIconProps) => (
    <svg
        width={width}
        height={height}
        viewBox="0 0 38 2"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M30 2h16V0H30v2zM-8 2H8V0H-8v2zM22 2h2V0h-2v2zM14 2h2V0h-2v2z"
            fill="currentColor"
        />
    </svg>
);

export default LongDashDotDotLineIcon;
