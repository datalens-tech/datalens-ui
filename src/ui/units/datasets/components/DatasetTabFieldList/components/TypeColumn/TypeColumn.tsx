import React from 'react';

import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import type {AvailableFieldType, DATASET_FIELD_TYPES, DatasetFieldType} from 'shared';
import {DataTypeIcon} from 'ui';

import './TypeColumn.scss';

export type TypeColumnProps = {
    type: DATASET_FIELD_TYPES;
    datasetFieldType: DatasetFieldType;
};

const b = block('field-list-type-column');

export const TypeColumn: React.FC<TypeColumnProps> = (props: TypeColumnProps) => {
    const {type, datasetFieldType} = props;
    const typeTitle = i18n('dataset.dataset-editor.modify', `value_${type as AvailableFieldType}`);
    const mods: Partial<Record<DatasetFieldType, boolean>> = {
        [datasetFieldType.toLowerCase()]: true,
    };

    return (
        <div className={b()}>
            <DataTypeIcon className={b('icon', mods)} dataType={type} />
            <span className={b('title')}>{typeTitle}</span>
        </div>
    );
};
