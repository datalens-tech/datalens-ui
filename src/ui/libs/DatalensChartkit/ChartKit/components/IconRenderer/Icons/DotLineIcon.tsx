import React from 'react';

import type {LineIconProps} from '../types';

const DotLineIcon: React.FC<LineIconProps> = ({height, width, setLineWidth}: LineIconProps) => {
    const viewBoxHeight = setLineWidth ? parseInt(height, 10) : 2;
    const pathHeight = setLineWidth ? parseInt(height, 10) : 2;

    return (
        <svg
            width={width}
            height={height}
            fill="none"
            viewBox={`0 0 38 ${viewBoxHeight}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <g fill="currentColor">
                <path
                    d={`M0 0h2v${pathHeight}H0zM8 0h2v${pathHeight}H8zM16 0h2v${pathHeight}h-2zM24 0h2v${pathHeight}h-2zM32 0h2v${pathHeight}h-2z`}
                />
            </g>
        </svg>
    );
};

export default DotLineIcon;
