import React from 'react';

import type {CommonIconProps} from '../types';

const DashLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
    <svg
        width={width}
        height={height}
        fill="none"
        viewBox="0 0 38 2"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M-5 2h-4V0h4v2zM9 2H1V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm14 0h-8V0h8v2zm10 0h-4V0h4v2z"
                fill="currentColor"
            />
        </g>
    </svg>
);

export default DashLineIcon;
