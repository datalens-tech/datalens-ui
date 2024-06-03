import type {EntryFieldMeta} from './fields';

export interface CopyTemplateResponse {
    entryId: string;
    workbookId?: string;
}

export interface CopyTemplateArgs {
    templateName: string;
    connectionId?: string;
    workbookId?: string;
    path?: string;
    postfix?: string;
    meta?: NonNullable<EntryFieldMeta>;
}
