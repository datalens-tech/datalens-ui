import React from 'react';

import block from 'bem-cn-lite';

import './WorkbookIcon.scss';

const b = block('dl-workbook-icon');

type Props = {
    title: string;
    size?: number;
    fontSize?: number;
    lineHeight?: number;
};

export const WorkbookIcon: React.FC<Props> = ({
    title,
    size = 32,
    fontSize = 32,
    lineHeight = 32,
}) => {
    const letters = title.slice(0, 2);

    return (
        <div className={b()} style={{width: `${size}px`, height: `${size}px`}}>
            <div
                className={b('letters')}
                style={{fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`}}
            >
                {letters ? letters : 'wb'}
            </div>
        </div>
    );
};
