import React from 'react';

import block from 'bem-cn-lite';

const b = block('dl-table');

export const TableTitle = (props: {title: string | undefined}) => {
    const {title} = props;

    if (title) {
        return <div className={b('title')}>{title}</div>;
    }

    return null;
};
