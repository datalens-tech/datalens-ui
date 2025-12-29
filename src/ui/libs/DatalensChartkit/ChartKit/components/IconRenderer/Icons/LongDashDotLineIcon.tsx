import React from 'react';

import type {LineIconProps} from '../types';

const LongDashDotLineIcon: React.FC<LineIconProps> = ({
    height,
    width,
    setLineWidth,
}: LineIconProps) => {
    const viewBoxHeight = setLineWidth ? parseInt(height, 10) : 2;
    const pathY2 = setLineWidth ? parseInt(height, 10) : 2;
    const pathY0 = setLineWidth ? 0 : 0;

    return (
        <svg
            width={width}
            height={height}
            fill="none"
            viewBox={`0 0 38 ${viewBoxHeight}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d={`M26 ${pathY2}h16V${pathY0}H26v${pathY2}zM-4 ${pathY2}h16V${pathY0}H-4v${pathY2}zM18 ${pathY2}h2V${pathY0}h-2v${pathY2}z`}
                fill="currentColor"
            />
        </svg>
    );
};

export default LongDashDotLineIcon;
