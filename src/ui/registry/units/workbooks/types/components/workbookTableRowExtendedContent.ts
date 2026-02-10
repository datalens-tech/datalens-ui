import type {WorkbookWithPermissions} from 'shared/schema';
import type {WorkbookUnionEntry} from 'ui/units/workbooks/types';

export type WorkbookTableRowExtendedContentProps = {
    item: WorkbookUnionEntry;
    workbook: WorkbookWithPermissions;
    onUpdateSharedEntryBindings?: () => void;
};
