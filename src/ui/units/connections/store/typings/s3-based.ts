import type {FileSourceColumnType} from '../../../../../shared/schema';

export type CreatingSource = {
    id: string;
    file_id: string;
    title: string;
    column_types?: FileSourceColumnType[];
};

export type CreatedSource = {
    id: string;
    title: string;
};

export type ReplaceSource = {
    old_source_id: string;
    new_source_id: string;
};
