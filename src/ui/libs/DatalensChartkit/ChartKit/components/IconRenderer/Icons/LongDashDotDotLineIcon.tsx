import React from 'react';

import type {LineIconProps} from '../types';

const LongDashDotDotLineIcon: React.FC<LineIconProps> = ({
    width,
    height,
    setLineWidth,
}: LineIconProps) => {
    const viewBoxHeight = setLineWidth ? parseInt(height, 10) : 2;
    const pathY2 = setLineWidth ? parseInt(height, 10) : 2;
    const pathY0 = setLineWidth ? 0 : 0;

    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 38 ${viewBoxHeight}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d={`M30 ${pathY2}h16V${pathY0}H30v${pathY2}zM-8 ${pathY2}H8V${pathY0}H-8v${pathY2}zM22 ${pathY2}h2V${pathY0}h-2v${pathY2}zM14 ${pathY2}h2V${pathY0}h-2v${pathY2}z`}
                fill="currentColor"
            />
        </svg>
    );
};

export default LongDashDotDotLineIcon;
