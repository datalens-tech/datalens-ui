import type {ValueOf} from '../types';

export const EXPORT_FORMATS = {
    XLSX: 'xlsx',
    CSV: 'csv',
    ODS: 'ods',
    MARKDOWN: 'markdown',
    WIKI: 'wiki',
    SCREENSHOT: 'screenshort',
} as const;

export type ExportFormatsType = ValueOf<typeof EXPORT_FORMATS>;

export type ExportParams = {
    format: ExportFormatsType;
    delValues: string | null;
    delNumbers: string | null;
    encoding: string | null;
};
