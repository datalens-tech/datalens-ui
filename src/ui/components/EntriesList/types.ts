import type {EntryFields} from '../../../shared/schema';

export type EntryItem = Pick<EntryFields, 'entryId' | 'scope' | 'type' | 'key'> & {
    name?: string;
    createdBy?: string;
};
