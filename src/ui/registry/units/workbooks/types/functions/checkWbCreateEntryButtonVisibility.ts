import type {EntryScope} from '../../../../../../shared';
import type {WorkbookWithPermissions} from '../../../../../../shared/schema';

export type CheckWbCreateEntryButtonVisibility = (
    workbook: WorkbookWithPermissions,
    scope?: EntryScope,
) => boolean;
