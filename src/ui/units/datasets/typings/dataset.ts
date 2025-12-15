import type {EntryScope} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

export interface ObligatoryFilter {
    id: string;
    field_guid: string;
    managed_by: string;
    valid: boolean;
    default_filters: [
        {
            column: string;
            operation: string;
            values: string[];
        },
    ];
}

export type DatasetEntry = GetEntryResponse & {
    isDelegated?: boolean;
    scope: EntryScope.Connection;
    fake?: boolean;
};
