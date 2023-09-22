import React from 'react';

import block from 'bem-cn-lite';

import './ValueColumn.scss';

export type ValueColumnProps = {
    text: string | number | boolean;
};

const b = block('field-list-value-column');

export const ValueColumn: React.FC<ValueColumnProps> = (props: ValueColumnProps) => {
    const {text} = props;

    return <span className={b()}>{text.toString()}</span>;
};
