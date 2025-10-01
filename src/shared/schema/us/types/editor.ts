import type z from 'zod/v4';

import type {EntryAnnotationArgs, EntryUpdateMode} from '../../..';
import type {editorChartData} from '../schemas/editor';

import type {EntryFieldData, EntryFieldLinks, EntryFieldMeta, EntryFields} from './fields';

export interface CreateEditorChartResponse extends EntryFields {
    links: EntryFieldLinks;
}

export interface CreateEditorChartArgs {
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
    entryId: string;
    mode: 'save' | 'publish';
    data: EntryFieldData;
    revId?: string;
    meta?: EntryFieldMeta;
    links?: EntryFieldLinks;
    description?: string;
    annotation?: EntryAnnotationArgs;
}

export type EditorChartData = z.infer<typeof editorChartData>;
