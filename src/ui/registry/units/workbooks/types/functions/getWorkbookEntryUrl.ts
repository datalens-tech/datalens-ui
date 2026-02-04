import type {WorkbookWithPermissions} from '../../../../../../shared/schema';
import type {WorkbookUnionEntry} from '../../../../../units/workbooks/types';

export type GetWorkbookEntryUrl = (args: {
    workbookEntry: WorkbookUnionEntry;
    workbook: WorkbookWithPermissions;
    isSharedEntry?: boolean;
}) => string;
