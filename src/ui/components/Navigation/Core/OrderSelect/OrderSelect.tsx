import React from 'react';

import type {SelectProps} from '@gravity-ui/uikit';
import {Select} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {ORDER_DIRECTION, ORDER_FIELD} from '../../constants';
import type {FilterOrderByDirection, FilterOrderByField} from '../../types';

const DELIMITER = '_';
const i18n = I18n.keyset('component.navigation.view');

function createOrderValue(field: FilterOrderByField, direction: FilterOrderByDirection) {
    return `${field}${DELIMITER}${direction}`;
}

function getItemsOrderBy() {
    return [
        {
            value: createOrderValue(ORDER_FIELD.NAME, ORDER_DIRECTION.ASC),
            content: i18n('value_name-ascending'),
        },
        {
            value: createOrderValue(ORDER_FIELD.NAME, ORDER_DIRECTION.DESC),
            content: i18n('value_name-descending'),
        },
        {
            value: createOrderValue(ORDER_FIELD.CREATED_AT, ORDER_DIRECTION.DESC),
            content: i18n('value_date-descending'),
        },
        {
            value: createOrderValue(ORDER_FIELD.CREATED_AT, ORDER_DIRECTION.ASC),
            content: i18n('value_date-ascending'),
        },
    ];
}

type OrderBy = {
    field: FilterOrderByField;
    direction: FilterOrderByDirection;
};

type Props = {
    orderBy: OrderBy;
    onChange: (orderBy: OrderBy) => void;
    disabled?: boolean;
};

const OrderSelect = ({orderBy, onChange, disabled}: Props) => {
    const handleUpdate: SelectProps['onUpdate'] = ([value]) => {
        const [field, direction] = value.split(DELIMITER) as [
            FilterOrderByField,
            FilterOrderByDirection,
        ];
        onChange({field, direction});
    };

    return (
        <Select
            options={getItemsOrderBy()}
            value={[createOrderValue(orderBy.field, orderBy.direction)]}
            onUpdate={handleUpdate}
            disabled={disabled}
        />
    );
};

export default OrderSelect;
