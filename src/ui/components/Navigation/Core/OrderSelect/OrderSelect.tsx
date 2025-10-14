import React from 'react';

import {I18n} from 'i18n';

import {OrderBySelect, SORT_TYPE} from '../../../OrderBySelect';
import type {OrderBy, OrderByOptions, SortType} from '../../../OrderBySelect';
import {ORDER_DIRECTION, ORDER_FIELD} from '../../constants';
import type {FilterOrderByDirection, FilterOrderByField} from '../../types';

const i18n = I18n.keyset('component.navigation.view');

function getItemsOrderBy(): OrderByOptions<SortType, FilterOrderByField, FilterOrderByDirection> {
    return {
        [SORT_TYPE.ALPHABET_ASC]: {
            field: ORDER_FIELD.NAME,
            direction: ORDER_DIRECTION.ASC,
            content: i18n('value_name-ascending'),
        },
        [SORT_TYPE.ALPHABET_DESC]: {
            field: ORDER_FIELD.NAME,
            direction: ORDER_DIRECTION.DESC,
            content: i18n('value_name-descending'),
        },
        [SORT_TYPE.FIRST_NEW]: {
            field: ORDER_FIELD.CREATED_AT,
            direction: ORDER_DIRECTION.DESC,
            content: i18n('value_date-descending'),
        },
        [SORT_TYPE.FIRST_OLD]: {
            field: ORDER_FIELD.CREATED_AT,
            direction: ORDER_DIRECTION.ASC,
            content: i18n('value_date-ascending'),
        },
    };
}

type Props = {
    orderBy: OrderBy<FilterOrderByField, FilterOrderByDirection>;
    onChange: (orderBy: OrderBy<FilterOrderByField, FilterOrderByDirection>) => void;
    disabled?: boolean;
};

const OrderSelect = ({orderBy, onChange, disabled}: Props) => {
    const orderByOptions = React.useMemo(() => getItemsOrderBy(), []);

    return <OrderBySelect {...{orderBy, orderByOptions, onChange, disabled}} />;
};

export default OrderSelect;
