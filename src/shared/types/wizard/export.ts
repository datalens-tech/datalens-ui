import type {ServerFieldFormatting} from '../config/wizard';

export type ColumnExportSettings = {
    field: string;
    name: string;
    formatter?: ServerFieldFormatting;
    type?: 'number' | 'text';
};

export type SeriesExportSettings = {
    columns: ColumnExportSettings[];
};
