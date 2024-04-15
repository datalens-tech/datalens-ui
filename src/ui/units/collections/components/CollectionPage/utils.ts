import {
    CollectionPageViewMode,
    collectionPageViewModeStore,
} from '../../../../components/CollectionFilters';
import Utils, {CollectionFiltersStorage} from '../../../../utils';
import {DEFAULT_FILTERS} from '../constants';

export const getUserDefaultFilters = () => ({
    filterString: undefined,
    orderField: CollectionFiltersStorage.restore()?.orderField ?? DEFAULT_FILTERS.orderField,
    orderDirection:
        CollectionFiltersStorage.restore()?.orderDirection ?? DEFAULT_FILTERS.orderDirection,
    mode: CollectionFiltersStorage.restore()?.mode ?? DEFAULT_FILTERS.mode,
    onlyMy: CollectionFiltersStorage.restore()?.onlyMy ?? DEFAULT_FILTERS.onlyMy,
});

export const getUserDefaultCollectionPageViewMode = () =>
    Utils.restore(collectionPageViewModeStore) || CollectionPageViewMode.Table;
