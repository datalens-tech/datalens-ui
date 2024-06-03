import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DATASET_FIELD_TYPES} from 'shared';
import {DatasetFieldType, isMeasureName, isMeasureValue} from 'shared';

import {getIconForDataType} from '../../../../../utils/helpers';

import './FieldInfo.scss';

type FieldInfoProps = {
    dataType: DATASET_FIELD_TYPES;
    type: DatasetFieldType;
    title: string;
};

const b = block('field-info');

export const FieldInfo: React.FC<FieldInfoProps> = (props: FieldInfoProps) => {
    const {dataType, title, type} = props;

    const iconData = React.useMemo(() => getIconForDataType(dataType), [dataType]);

    const mods = {
        dimension: type === DatasetFieldType.Dimension || isMeasureName({type, title}),
        measure: type === DatasetFieldType.Measure || isMeasureValue({type, title}),
        parameter: type === DatasetFieldType.Parameter,
    };

    return (
        <div className={b('container')}>
            <Icon data={iconData} className={b('icon', mods)} />
            <span className={b('title')}>{title}</span>
        </div>
    );
};
