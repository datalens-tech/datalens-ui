import React from 'react';

import type {LineIconProps} from '../types';

const DashLineIcon: React.FC<LineIconProps> = ({height, width, setLineWidth}: LineIconProps) => {
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
            <g>
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d={`M-5 ${pathY2}h-4V${pathY0}h4v${pathY2}zM9 ${pathY2}H1V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm14 0h-8V${pathY0}h8v${pathY2}zm10 0h-4V${pathY0}h4v${pathY2}z`}
                    fill="currentColor"
                />
            </g>
        </svg>
    );
};

export default DashLineIcon;
