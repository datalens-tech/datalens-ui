import React from 'react';

import type {LineIconProps} from '../types';

const DashDotLineIcon: React.FC<LineIconProps> = ({
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
            d={`M30 ${2 + lineWidth / 2}h8V${2 - lineWidth / 2}h-8v${lineWidth}zM8 ${2 + lineWidth / 2}h8V${2 - lineWidth / 2}H8v${lineWidth}zM22 ${2 + lineWidth / 2}h2V${2 - lineWidth / 2}h-2v${lineWidth}zM0 ${2 + lineWidth / 2}h2V${2 - lineWidth / 2}H0v${lineWidth}z`}
            fill="currentColor"
        />
    </svg>
);

export default DashDotLineIcon;
