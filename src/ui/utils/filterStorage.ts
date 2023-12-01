import {GetCollectionContentMode} from 'shared/schema';
import {OrderBasicField, OrderDirection} from 'shared/schema/us/types/sort';
import {Utils} from 'ui';

const KEY = 'collectionPageFilters';

type Filter = {
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    mode?: GetCollectionContentMode;
    onlyMy?: boolean;
};

export class FilterStorage {
    static restore(): Filter | null {
        return Utils.restore<Filter>(KEY);
    }

    static store(data: Filter = {}) {
        Utils.store(KEY, {
            ...(FilterStorage.restore() || {}),
            ...data,
        });
    }
}
