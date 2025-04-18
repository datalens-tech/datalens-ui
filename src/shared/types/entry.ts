import type {EntryMetaFields} from '../schema/us/types/fields';

export type MinimumEntryFields = Pick<EntryMetaFields, 'entryId' | 'key' | 'type' | 'scope'>;

export type EntryPublicAuthor = {text?: string; link?: string};

export type WorkbookId = string | null;

export type TransferIdMapping = Record<string, string>;

export type TransferNotification = {
    level: 'info' | 'warning' | 'critical';
    code: string;
    details?: object;
};
