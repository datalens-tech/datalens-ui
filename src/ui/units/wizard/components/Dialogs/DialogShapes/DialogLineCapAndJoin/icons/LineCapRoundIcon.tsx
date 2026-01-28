import React from 'react';

export const LineCapRoundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        {...props}
    >
        <path
            d="M2.51594 1.98763C8.02214 1.98763 13.082 0.992346 13.082 8.01058C13.0819 14.8157 7.83019 14.0335 2.51594 14.0335"
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
