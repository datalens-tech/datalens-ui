import type {EditorEntryData} from './common';

export interface TabData {
    id: string;
    language: string;
    name: string;
    docs?: {
        path: string;
        title: string;
    }[];
}

export type ScriptsValues = EditorEntryData;
