import type {EntryMetaFields} from '../schema/us/types/fields';

export type MinimumEntryFields = Pick<EntryMetaFields, 'entryId' | 'key' | 'type' | 'scope'>;

export type EntryPublicAuthor = {text?: string; link?: string};
