import React from 'react';

import type {LineIconProps} from '../types';

const SolidLineIcon: React.FC<LineIconProps> = ({width, height, lineWidth = 2}: LineIconProps) => {
    return (
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
                d={`M38 ${2 + lineWidth / 2}H0V${2 - lineWidth / 2}h38v${lineWidth}z`}
                fill="currentColor"
            />
        </svg>
    );
};

export default SolidLineIcon;
