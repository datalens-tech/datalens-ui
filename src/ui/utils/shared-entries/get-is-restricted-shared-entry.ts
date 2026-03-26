import type {WorkbookEntry} from 'shared';
import type {RestrictedSharedWorkbookEntry} from 'shared/schema';

export const getIsRestrictedSharedEntry = (
    entry: WorkbookEntry,
): entry is RestrictedSharedWorkbookEntry => {
    return 'isRestricted' in entry && entry.isRestricted === true;
};

export const getIsNotRestrictedSharedEntry = <T extends WorkbookEntry>(
    entry: T,
): entry is Exclude<T, RestrictedSharedWorkbookEntry> => {
    return !entry.isLocked;
};
