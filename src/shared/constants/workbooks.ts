import type {ValueOf} from '..';

export const WORKBOOK_STATUS = {
    CREATING: 'creating',
    DELETING: 'deleting',
    ACTIVE: 'active',
    DELETED: 'deleted',
} as const;

export type WorkbookStatus = ValueOf<typeof WORKBOOK_STATUS>;
