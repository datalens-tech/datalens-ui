import React from 'react';

import block from 'bem-cn-lite';
import type {TableTitle} from 'shared';

const b = block('dl-table');

type Props = {
    title?: TableTitle;
};

export const TableTitleView = (props: Props) => {
    const {title} = props;

    if (title) {
        return (
            <div className={b('title')} style={title.style}>
                {title.text}
            </div>
        );
    }

    return null;
};
