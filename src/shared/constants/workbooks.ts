import type {ValueOf} from '..';

export const WORKBOOK_STATUS = {
    CREATING: 'creating',
    DELETING: 'deleting',
} as const;

export type WorkbookStatus = ValueOf<typeof WORKBOOK_STATUS>;
