import type {WorkbookEntry} from 'shared';
import type {GetSharedEntryResponse} from 'shared/schema';

export const getIsSharedEntry = (entry: WorkbookEntry): entry is GetSharedEntryResponse => {
    return 'isDelegated' in entry;
};
