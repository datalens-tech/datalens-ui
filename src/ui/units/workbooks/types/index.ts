import {GetEntryResponse} from '../../../../shared/schema';
import {OrderDirection, OrderWorkbookEntriesField} from '../../../../shared/schema/us/types/sort';

export type WorkbookEntriesFilters = {
    orderField: OrderWorkbookEntriesField;
    orderDirection: OrderDirection;
    filterString?: string;
};

export type WorkbookEntry = GetEntryResponse & {name: string};
