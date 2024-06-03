import type {GetCollectionContentMode} from 'shared/schema';
import type {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import {Utils} from 'ui';

const KEY = 'collectionPageFilters';

type Filters = {
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    mode?: GetCollectionContentMode;
    onlyMy?: boolean;
};

export class CollectionFiltersStorage {
    static restore(): Filters | null {
        return Utils.restore<Filters>(KEY);
    }

    static store(data: Filters = {}) {
        Utils.store(KEY, {
            ...(CollectionFiltersStorage.restore() || {}),
            ...data,
        });
    }
}
