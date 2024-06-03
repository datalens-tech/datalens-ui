import React from 'react';

import type {CommonIconProps} from '../types';

const ShortDashDotLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
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
            d="M34 2h6V0h-6v2zM22 2h6V0h-6v2zM30 2h2V0h-2v2zM10 2h6V0h-6v2zM18 2h2V0h-2v2zM-2 2h6V0h-6v2zM6 2h2V0H6v2z"
            fill="currentColor"
        />
    </svg>
);

export default ShortDashDotLineIcon;
