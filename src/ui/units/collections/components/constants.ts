import type {
    GetCollectionContentMode,
    OrderBasicField,
    OrderDirection,
} from '../../../../shared/schema';

export const PAGE_SIZE = 50;

export const DEFAULT_FILTERS: {
    filterString?: string;
    orderField: OrderBasicField;
    orderDirection: OrderDirection;
    mode: GetCollectionContentMode;
    onlyMy: boolean;
} = {
    filterString: undefined,
    orderField: 'createdAt',
    orderDirection: 'desc',
    mode: 'all',
    onlyMy: false,
};
