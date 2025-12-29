import React from 'react';

import type {LineIconProps} from '../types';

const ShortDashDotLineIcon: React.FC<LineIconProps> = ({
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
                d={`M34 ${pathY2}h6V${pathY0}h-6v${pathY2}zM22 ${pathY2}h6V${pathY0}h-6v${pathY2}zM30 ${pathY2}h2V${pathY0}h-2v${pathY2}zM10 ${pathY2}h6V${pathY0}h-6v${pathY2}zM18 ${pathY2}h2V${pathY0}h-2v${pathY2}zM-2 ${pathY2}h6V${pathY0}h-6v${pathY2}zM6 ${pathY2}h2V${pathY0}H6v${pathY2}z`}
                fill="currentColor"
            />
        </svg>
    );
};

export default ShortDashDotLineIcon;
