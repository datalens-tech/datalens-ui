import type {WorkbookWithPermissions} from 'shared/schema';
import type {WorkbookEntry} from 'ui/units/workbooks/types';

export type WorkbookTableRowExtendedContentProps = {
    item: WorkbookEntry;
    workbook: WorkbookWithPermissions;
    onUpdateSharedEntryBindings?: () => void;
};
