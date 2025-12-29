import React from 'react';

import type {LineIconProps} from '../types';

const LongDashLineIcon: React.FC<LineIconProps> = ({
    height,
    width,
    lineWidth = 2,
}: LineIconProps) => (
    <svg
        width={width}
        height={height}
        fill="none"
        viewBox={`0 ${2 - lineWidth / 2} 38 ${lineWidth}`}
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={`M24 ${2 + lineWidth / 2}h16V${2 - lineWidth / 2}H24v${lineWidth}zM0 ${2 + lineWidth / 2}h16V${2 - lineWidth / 2}H0v${lineWidth}z`}
            fill="currentColor"
        />
    </svg>
);

export default LongDashLineIcon;
