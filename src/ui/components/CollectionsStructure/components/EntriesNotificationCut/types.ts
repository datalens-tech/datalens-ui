import type {RowEntryData} from 'ui/components/EntryRow/EntryRow';

// TODO: use type from api request
export type TempImportExportDataType = {
    notifications: {
        code?: string;
        message: string;
        level: 'info' | 'warning' | 'critical';
        entries: RowEntryData[];
    }[];
};
