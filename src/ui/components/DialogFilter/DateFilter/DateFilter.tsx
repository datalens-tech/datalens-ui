import React from 'react';

import block from 'bem-cn-lite';

import type {DatasetField} from '../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../shared';
import RelativeDatesPicker from '../../RelativeDatesPicker/RelativeDatesPicker';
import type {Operation} from '../constants';
import type {ChangeValue} from '../typings';

const b = block('dl-dialog-filter');

interface DateFilterProps {
    values: string[];
    field: DatasetField;
    operation: Operation;
    changeValue: ChangeValue;
}

const DateFilter: React.FC<DateFilterProps> = (props) => {
    const {values, field, operation, changeValue} = props;
    const {data_type: dataType} = field;

    const onChange = React.useCallback(
        (value: string, {valid}: {valid: boolean}) => {
            changeValue([value], {valid});
        },
        [changeValue],
    );

    return (
        <div className={b('filter-date')}>
            <RelativeDatesPicker
                range={operation.range}
                value={values[0]}
                withTime={dataType === DATASET_FIELD_TYPES.GENERICDATETIME}
                onChange={onChange}
            />
        </div>
    );
};

export default DateFilter;
