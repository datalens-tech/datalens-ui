import {EntryFieldMeta} from './fields';

export interface CopyTemplateResponse {
    entryId: string;
}

export interface CopyTemplateArgs {
    templateName: string;
    connectionId?: string;
    path?: string;
    postfix?: string;
    meta?: NonNullable<EntryFieldMeta>;
}
