import type {Required} from 'utility-types';

import type {EntryFieldData, EntryFieldMeta, GetEntryResponse} from '../../../../shared/schema';

export interface GraphNodeTypeData {
    url: string;
    params: string;
    js: string;
    ui: string;
    graph: string;
    statface_graph: string;
    shared: string;
}

export interface TableNodeTypeData {
    url: string;
    params: string;
    js: string;
    ui: string;
    table: string;
    shared: string;
}

export interface TextNodeTypeData {
    url: string;
    params: string;
    js: string;
    statface_text: string;
    shared: string;
}

export interface MarkdownNodeTypeData {
    url: string;
    params: string;
    js: string;
    shared: string;
}

export interface MarkupNodeTypeData {
    url: string;
    params: string;
    js: string;
    config: string;
    shared: string;
}

export interface MetricNodeTypeData {
    url: string;
    params: string;
    js: string;
    statface_metric: string;
    shared: string;
}

export interface MapNodeTypeData {
    url: string;
    params: string;
    js: string;
    map: string;
    statface_map: string;
    shared: string;
}

export interface YmapNodeTypeData {
    url: string;
    params: string;
    js: string;
    ymap: string;
    shared: string;
}

export interface ControlNodeTypeData {
    url: string;
    params: string;
    js: string;
    ui: string;
    shared: string;
}

export interface ModuleTypeData {
    js: string;
    documentation_ru: string;
    documentation_en: string;
}

export type EditorEntryData =
    | GraphNodeTypeData
    | TableNodeTypeData
    | TextNodeTypeData
    | MarkdownNodeTypeData
    | MetricNodeTypeData
    | MapNodeTypeData
    | YmapNodeTypeData
    | ControlNodeTypeData
    | ModuleTypeData;

export interface EditorEntry extends Required<Omit<GetEntryResponse, 'data'>, 'permissions'> {
    meta: EntryFieldMeta<{
        is_release?: boolean;
    }>;
    data: NonNullable<EntryFieldData<EditorEntryData>>;
    fake?: false;
}

export type EditorFakeEntry = Omit<EditorEntry, 'entryId'> & {
    entryId: null;
    fake: true;
};

export type EditorEntryDataApi = Partial<EditorEntryData> | null;
