import React from 'react';

import {
    BranchesDown,
    Calendar,
    CopyCheckXmark,
    GeoDots,
    GeoPolygons,
    Hashtag,
    SquareBracketsBarsVertical,
    SquareBracketsLetterA,
    SquareLetterT,
    TriangleExclamationFill,
} from '@gravity-ui/icons';
import type {IconProps} from '@gravity-ui/uikit';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';

import {DATASET_FIELD_TYPES, DatasetFieldType} from '../../../shared';

import './DataTypeIcon.scss';

const b = block('dl-data-type-icon');

export interface DataTypeIconProps extends Omit<IconProps, 'data'> {
    dataType: DATASET_FIELD_TYPES;
    fieldType?: DatasetFieldType;
    className?: string;
}

// eslint-disable-next-line complexity
const DataTypeIcon: React.FC<DataTypeIconProps> = (props) => {
    const {size, dataType, fieldType, className, ...restIconProps} = props;

    if (!Object.values(DATASET_FIELD_TYPES).includes(dataType)) {
        return null;
    }

    let data;

    switch (dataType) {
        case DATASET_FIELD_TYPES.FLOAT:
        case DATASET_FIELD_TYPES.UINTEGER:
        case DATASET_FIELD_TYPES.INTEGER:
            data = Hashtag;
            break;
        case DATASET_FIELD_TYPES.BOOLEAN:
            data = CopyCheckXmark;
            break;
        case DATASET_FIELD_TYPES.DATE:
        case DATASET_FIELD_TYPES.GENERICDATETIME:
        case DATASET_FIELD_TYPES.DATETIMETZ:
            data = Calendar;
            break;
        case DATASET_FIELD_TYPES.GEOPOINT:
            data = GeoDots;
            break;
        case DATASET_FIELD_TYPES.GEOPOLYGON:
            data = GeoPolygons;
            break;
        case DATASET_FIELD_TYPES.UNSUPPORTED:
            data = TriangleExclamationFill;
            break;
        case DATASET_FIELD_TYPES.ARRAY_FLOAT:
        case DATASET_FIELD_TYPES.ARRAY_INT:
        case DATASET_FIELD_TYPES.ARRAY_STR:
            data = SquareBracketsBarsVertical;
            break;
        case DATASET_FIELD_TYPES.TREE_FLOAT:
        case DATASET_FIELD_TYPES.TREE_INT:
        case DATASET_FIELD_TYPES.TREE_STR:
            data = BranchesDown;
            break;
        case DATASET_FIELD_TYPES.MARKUP:
            data = SquareBracketsLetterA;
            break;
        case DATASET_FIELD_TYPES.STRING:
        default:
            data = SquareLetterT;
            break;
    }

    const mods = {
        dimension:
            fieldType === DatasetFieldType.Dimension ||
            (fieldType === DatasetFieldType.Pseudo && dataType === DATASET_FIELD_TYPES.STRING),
        measure: fieldType === DatasetFieldType.Measure,
        parameter: fieldType === DatasetFieldType.Parameter,
    };

    return <Icon data={data} size={size} className={b(mods, className)} {...restIconProps} />;
};

DataTypeIcon.defaultProps = {
    size: 14,
    className: '',
};

// To make uikit/Button component interprets the DataTypeIcon as an icon and sets the necessary margins
DataTypeIcon.displayName = 'Icon';

export default DataTypeIcon;
