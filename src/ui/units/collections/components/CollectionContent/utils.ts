import type {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions} from 'shared/schema/us/types/collections';
import type {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';

export const customizeCollectionsActions = (
    _item: CollectionWithPermissions,
    actions: (DropdownMenuItem[] | DropdownMenuItem)[],
) => actions;

export const customizeWorkbooksActions = (
    _item: WorkbookWithPermissions,
    actions: (DropdownMenuItem[] | DropdownMenuItem)[],
) => actions;
