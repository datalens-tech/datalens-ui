import type {ValueOf} from 'shared';
import type {EntryMetaFields} from 'shared/schema';

export const ENTRY_SCOPE_OPTIONS = {
    CONNECTIONS: 'connection',
    DATASETS: 'dataset',
    WIDGETS: 'widget',
} as const;

export type EntryOptionScope = ValueOf<typeof ENTRY_SCOPE_OPTIONS>;

export function isEntryOptionScope(scope: string): scope is EntryOptionScope {
    return Object.values(ENTRY_SCOPE_OPTIONS).includes(scope as EntryOptionScope);
}

export type EntrySuggestItem = Omit<EntryMetaFields, 'tenantId'> & {
    name: string;
};
