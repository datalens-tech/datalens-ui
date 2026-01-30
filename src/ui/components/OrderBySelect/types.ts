import type {ValuesType} from 'utility-types';

import type {SORT_TYPE} from './constants';

export type SortType = ValuesType<typeof SORT_TYPE>;

export type OrderBy<OrderByField, OrderByDirection> = {
    field: OrderByField;
    direction: OrderByDirection;
};

export type OrderByOptions<OrderByKey extends string, OrderByField, OrderByDirection> = Record<
    OrderByKey,
    {content: string} & OrderBy<OrderByField, OrderByDirection>
>;
