import React from 'react';

import block from 'bem-cn-lite';

import './WorkbookIcon.scss';

const b = block('dl-workbook-icon');

type Props = {
    title: string;
    size?: number;
};

export const WorkbookIcon: React.FC<Props> = ({title, size = 32}) => {
    const letters = title.slice(0, 2);

    return (
        <div className={b()} style={{width: `${size}px`, height: `${size}px`}}>
            <div
                className={b('letters')}
                style={{fontSize: `${Math.round(size / 2.5)}px`, lineHeight: `${size}px`}}
            >
                {letters ? letters : 'wb'}
            </div>
        </div>
    );
};
