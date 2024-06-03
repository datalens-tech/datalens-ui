import React from 'react';

import type {CommonIconProps} from '../types';

const LongDashLineIcon: React.FC<CommonIconProps> = ({height, width}: CommonIconProps) => (
    <svg
        width={width}
        height={height}
        fill="none"
        viewBox="2 2 38 2"
        xmlns="http://www.w3.org/2000/svg"
    >
        <g fill="currentColor">
            <path d="M0 2h16v2H0zM24 2h16v2H24z" />
        </g>
    </svg>
);

export default LongDashLineIcon;
