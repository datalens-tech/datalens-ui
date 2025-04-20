import type {ValueOf} from '../types';

export const EXPORT_FORMATS = {
    XLSX: 'xlsx',
    CSV: 'csv',
    MARKDOWN: 'markdown',
    WIKI: 'wiki',
    SCREENSHOT: 'screenshort',
} as const;

export type ExportFormatsType = ValueOf<typeof EXPORT_FORMATS>;
