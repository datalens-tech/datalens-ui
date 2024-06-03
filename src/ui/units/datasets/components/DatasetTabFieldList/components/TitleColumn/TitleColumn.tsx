import React from 'react';

import block from 'bem-cn-lite';
import type {DATASET_FIELD_TYPES} from 'shared';
import {DataTypeIcon} from 'ui';

import './TitleColumn.scss';

export type TitleColumnProps = {
    title: string;
    type?: DATASET_FIELD_TYPES;
};

const b = block('field-list-title-column');

export const TitleColumn: React.FC<TitleColumnProps> = (props: TitleColumnProps) => {
    const {title, type} = props;

    return (
        <div className={b()}>
            {type && <DataTypeIcon className={b('icon')} dataType={type} width={16} />}
            <span className={b('title')}>{title}</span>
        </div>
    );
};
