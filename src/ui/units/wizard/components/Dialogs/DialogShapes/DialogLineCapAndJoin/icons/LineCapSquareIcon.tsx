import React from 'react';

export const LineCapSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        {...props}
    >
        <path
            d="M2.51594 1.97705L13.082 1.97705L13.082 8L13.082 14.023L2.51594 14.0229"
            stroke="black"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            strokeLinecap="round"
        />
        <line
            x1="2.49365"
            y1="8.00061"
            x2="8.99365"
            y2="8.00061"
            stroke="black"
            strokeOpacity="0.85"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="3 3"
        />
    </svg>
);
