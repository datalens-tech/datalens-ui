import React from 'react';

import type {CommonIconProps} from '../types';

const LongDashDotLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
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
            d="M26 2h16V0H26v2zM-4 2h16V0H-4v2zM18 2h2V0h-2v2z"
            fill="currentColor"
        />
    </svg>
);

export default LongDashDotLineIcon;
