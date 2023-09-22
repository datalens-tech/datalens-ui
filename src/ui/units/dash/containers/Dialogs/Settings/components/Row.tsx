import React from 'react';

import block from 'bem-cn-lite';

import '../Settings.scss';

const b = block('dialog-settings');

type RowProps = {
    alignTop?: boolean;
};

export const Row: React.FC<RowProps> = ({children, alignTop}) => {
    return <div className={b('row', {'align-top': alignTop})}>{children}</div>;
};
