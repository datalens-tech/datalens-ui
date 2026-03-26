import type {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

export type DatasetEntry = GetEntryResponse & {
    isDelegated?: boolean;
    scope: EntryScope.Connection;
    fake?: boolean;
};
