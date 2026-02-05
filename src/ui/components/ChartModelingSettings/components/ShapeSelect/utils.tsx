import React from 'react';

import {line as lineGenerator} from 'd3';
import type {LineShapeType} from 'shared';

function getLineDashArray(dashStyle: LineShapeType, strokeWidth = 2) {
    const arrayValue = dashStyle
        .toLowerCase()
        .replace('shortdashdotdot', '3,1,1,1,1,1,')
        .replace('shortdashdot', '3,1,1,1')
        .replace('shortdot', '1,1,')
        .replace('shortdash', '3,1,')
        .replace('longdash', '8,3,')
        .replace(/dot/g, '1,3,')
        .replace('dash', '4,3,')
        .replace(/,$/, '')
        .split(',')
        .map((part) => {
            return `${parseInt(part, 10) * strokeWidth}`;
        });

    return arrayValue.join(',').replace(/NaN/g, 'none');
}

const line = lineGenerator();
export function getShapedLineIcon({
    shape,
    width,
    height = 2,
}: {
    width: number;
    height: number;
    shape: LineShapeType;
}) {
    const path = line([
        [0, height / 2],
        [width, height / 2],
    ]);

    return (
        <svg width={width} height={height}>
            <g>
                <path
                    fill="none"
                    d={path ?? ''}
                    stroke="currentColor"
                    strokeWidth={height}
                    strokeDasharray={getLineDashArray(shape)}
                ></path>
            </g>
        </svg>
    );
}
