import type {ServerFieldFormatting} from '../config/wizard';

export type ColumnExportSettings = {
    id: string;
    field: string;
    name: string;
    formatter?: ServerFieldFormatting;
    format?: string;
    type?: 'number' | 'text' | 'date' | 'genericdatetime';
};

export type SeriesExportSettings = {
    columns: ColumnExportSettings[];
};
