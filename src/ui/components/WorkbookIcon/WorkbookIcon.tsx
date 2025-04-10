import React from 'react';

import block from 'bem-cn-lite';

import './WorkbookIcon.scss';

const b = block('dl-workbook-icon');

type Props = {
    title: string;
    size?: string;
};

type Size = {
    size: number;
    fontSize: number;
    lineHeight: number;
    borderRadius: number;
};

type SizeMap = Record<string, Size>;

const sizesMap: SizeMap = {
    xs: {
        size: 18,
        fontSize: 9,
        lineHeight: 18,
        borderRadius: 4,
    },
    s: {
        size: 20,
        fontSize: 8,
        lineHeight: 20,
        borderRadius: 6,
    },
    m: {
        size: 32,
        fontSize: 13,
        lineHeight: 32,
        borderRadius: 6,
    },
    l: {
        size: 125,
        fontSize: 32,
        lineHeight: 38,
        borderRadius: 12,
    },
    mobile: {
        size: 28,
        fontSize: 13,
        lineHeight: 18,
        borderRadius: 6,
    },
};

export const WorkbookIcon: React.FC<Props> = ({title, size = 'm'}) => {
    const letters = title.trim().slice(0, 2);

    return (
        <div
            className={b()}
            style={{
                width: `${sizesMap[size].size}px`,
                height: `${sizesMap[size].size}px`,
                borderRadius: `${sizesMap[size].borderRadius}px`,
            }}
        >
            <div
                className={b('letters')}
                style={{
                    fontSize: `${sizesMap[size].fontSize}px`,
                    lineHeight: `${sizesMap[size].lineHeight}px`,
                }}
            >
                {letters ? letters : 'wb'}
            </div>
        </div>
    );
};
