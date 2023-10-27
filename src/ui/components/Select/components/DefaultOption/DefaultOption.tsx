import React from 'react';

import {SelectOption} from '@gravity-ui/uikit/build/esm/components/Select/types';
import block from 'bem-cn-lite';

import './DefaultOption.scss';

export type DefaultOptionProps<T = any> = {
    option: SelectOption<T>;
};

const b = block('select-default-option');

export const DefaultOption = (props: DefaultOptionProps) => {
    const {option} = props;

    return (
        <div className={b()} title={String(option.content)}>
            {option.content}
        </div>
    );
};
