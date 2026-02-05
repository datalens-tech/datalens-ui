import type {WorkbookEntry} from 'shared';
import type {RestrictedSharedEntry} from 'shared/schema';

export const getIsRestrictedSharedEntry = (
    entry: WorkbookEntry,
): entry is RestrictedSharedEntry => {
    return 'isRestricted' in entry && entry.isRestricted === true;
};

export const getIsNotRestrictedSharedEntry = <T extends WorkbookEntry>(
    entry: T,
): entry is Exclude<T, RestrictedSharedEntry> => {
    return !entry.isLocked;
};
