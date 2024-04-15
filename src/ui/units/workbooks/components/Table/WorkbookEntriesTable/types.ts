import {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import {WorkbookEntry} from 'ui/units/workbooks/types/index';

interface WorkbookEntriesTableProps {
    workbook: WorkbookWithPermissions;
    onRenameEntry: (data: WorkbookEntry) => void;
    onDeleteEntry: (data: WorkbookEntry) => void;
    onDuplicateEntry: (data: WorkbookEntry) => void;
    onCopyEntry: (data: WorkbookEntry) => void;
}

export {WorkbookEntriesTableProps};
