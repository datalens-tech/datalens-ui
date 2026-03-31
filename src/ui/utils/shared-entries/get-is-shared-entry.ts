import type {WorkbookEntry} from 'shared';
import type {GetEntryResponse, SharedWorkbookEntry} from 'shared/schema';

export const getIsSharedEntry = (
    entry: WorkbookEntry | GetEntryResponse,
): entry is SharedWorkbookEntry => {
    return 'isDelegated' in entry;
};
