import type {ValueOf} from '..';

export const WORKBOOK_STATUS = {
    IMPORTING: 'importing',
} as const;

export type WorkbookStatus = ValueOf<typeof WORKBOOK_STATUS>;
