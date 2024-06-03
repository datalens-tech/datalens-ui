import type {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';
import {makeFunctionTemplate} from 'shared/utils/makeFunctionTemplate';

export const collectionsFunctionsMap = {
    customizeCollectionsActions:
        makeFunctionTemplate<
            (
                item: CollectionWithPermissions,
                actions: (DropdownMenuItem[] | DropdownMenuItem)[],
            ) => (DropdownMenuItem[] | DropdownMenuItem)[]
        >(),
    customizeWorkbooksActions:
        makeFunctionTemplate<
            (
                item: WorkbookWithPermissions,
                actions: (DropdownMenuItem[] | DropdownMenuItem)[],
            ) => (DropdownMenuItem[] | DropdownMenuItem)[]
        >(),
} as const;
