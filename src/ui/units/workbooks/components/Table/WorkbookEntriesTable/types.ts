import type {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';
import type {WorkbookEntry} from 'ui/units/workbooks/types/index';

interface WorkbookEntriesTableProps<T extends WorkbookEntry> {
    workbook: WorkbookWithPermissions;
    onRenameEntry?: (data: T) => void;
    onDeleteEntry?: (data: T) => void;
    onDuplicateEntry?: (data: T) => void;
    onCopyEntry?: (data: T) => void;
    onShowRelatedClick?: (data: T) => void;
    onCopyId?: (data: T) => void;
    onUpdateSharedEntryBindings?: (data: T) => void;
}

export {WorkbookEntriesTableProps};
