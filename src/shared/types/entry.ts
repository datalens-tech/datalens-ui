import type {EntryMetaFields} from '../schema/us/types/fields';

export type MinimumEntryFields = Pick<EntryMetaFields, 'entryId' | 'key' | 'type' | 'scope'>;

export type EntryPublicAuthor = {text?: string; link?: string};

export type WorkbookId = string | null;

export type IdMapping = Record<string, string>;

export type ExportNotifications = Array<string>;

export type ImportVerifiedVia = 'verified_import' | 'unverified_import';
