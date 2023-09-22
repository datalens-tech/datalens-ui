import {EntryFieldData, EntryFieldLinks, EntryFieldMeta, EntryFields} from './fields';

export interface CreateEditorChartResponse extends EntryFields {
    links: EntryFieldLinks;
}

export interface CreateEditorChartArgs {
    type: string;
    key: string;
    data: EntryFieldData;
    meta?: EntryFieldMeta;
}

export interface UpdateEditorChartResponse extends EntryFields {
    links?: EntryFieldLinks;
}

export interface UpdateEditorChartArgs {
    entryId: string;
    mode: 'save' | 'publish';
    data: EntryFieldData;
    revId?: string;
    meta?: EntryFieldMeta;
}
