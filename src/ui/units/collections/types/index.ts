import {GetCollectionContentMode} from '../../../../shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from '../../../../shared/schema/us/types/sort';

export type GetCollectionContentArgs = {
    collectionId: string | null;
    collectionsPage?: string | null;
    workbooksPage?: string | null;
    filterString?: string;
    orderField?: OrderBasicField;
    orderDirection?: OrderDirection;
    onlyMy?: boolean;
    mode?: GetCollectionContentMode;
    pageSize?: number;
};
