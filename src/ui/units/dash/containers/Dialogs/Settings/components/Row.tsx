import React from 'react';

import block from 'bem-cn-lite';

import '../Settings.scss';

const b = block('dialog-settings');

type RowProps = {
    alignTop?: boolean;
    direction?: 'row' | 'column';
};

export const Row: React.FC<RowProps> = ({children, alignTop, direction = 'row'}) => {
    return <div className={b('row', {'align-top': alignTop, direction})}>{children}</div>;
};
