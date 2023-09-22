import React from 'react';

const CirclePointIcon: React.FC = ({width}: any) => (
    <svg
        width={width}
        height={width}
        viewBox={`0 0 20 20`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <circle cx="10" cy="10" r="10" fill="currentColor" />
    </svg>
);

export default CirclePointIcon;
