import type {EntryAnnotationArgs, EntryUpdateMode} from '../../..';

import type {EntryFieldData, EntryFieldLinks, EntryFieldMeta, EntryFields} from './fields';

export interface CreateEditorChartResponse extends EntryFields {
    links: EntryFieldLinks;
}

export interface CreateEditorChartArgs {
    version?: number;
    type: string;
    data: EntryFieldData;
    key?: string;
    meta?: EntryFieldMeta;
    workbookId?: string;
    name?: string;
    mode?: EntryUpdateMode;
    links?: EntryFieldLinks;
    description?: string;
    annotation?: EntryAnnotationArgs;
}

export interface UpdateEditorChartResponse extends EntryFields {
    links?: EntryFieldLinks;
}

export interface UpdateEditorChartArgs {
    version?: number;
    entryId: string;
    mode: 'save' | 'publish';
    data: EntryFieldData;
    revId?: string;
    meta?: EntryFieldMeta;
    links?: EntryFieldLinks;
    description?: string;
    annotation?: EntryAnnotationArgs;
}
