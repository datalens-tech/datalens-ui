import type {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import type {WorkbookEntry} from 'ui/units/workbooks/types/index';

interface WorkbookEntriesTableProps {
    workbook: WorkbookWithPermissions;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
    onShowRelatedClick: (data: WorkbookEntry) => void;
    onCopyId?: (data: WorkbookEntry) => void;
}

export {WorkbookEntriesTableProps};
