import {GetCollectionContentMode} from '../../../../../shared/schema/us/types/collections';
import {OrderBasicField, OrderDirection} from '../../../../../shared/schema/us/types/sort';

export enum DialogState {
    None = 'none',
    AddDemoWorkbook = 'addDemoWorkbook',
    AddLearningMaterialWorkbook = 'addLearningMaterialWorkbook',
    EditCollectionAccess = 'editCollectionAccess',
}

export const PAGE_SIZE = 50;

export const DEFAULT_FILTERS = {
    filterString: undefined,
    orderField: OrderBasicField.CreatedAt,
    orderDirection: OrderDirection.Desc,
    mode: GetCollectionContentMode.All,
    onlyMy: false,
};
