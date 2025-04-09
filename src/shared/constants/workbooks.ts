import type {ValueOf} from '..';

export const WORKBOOK_STATUS = {
    CREATING: 'creating',
} as const;

export type WorkbookStatus = ValueOf<typeof WORKBOOK_STATUS>;
