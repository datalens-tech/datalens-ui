import type {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';
import {makeFunctionTemplate} from 'shared/utils/makeFunctionTemplate';

import type {
    CustomizeEmptyPlaceholder,
    CustomizeNoCreatePermissionDialog,
    GetPublicGalleryEntry,
} from './types';

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
    customizeEmptyPlaceholder: makeFunctionTemplate<CustomizeEmptyPlaceholder>(),
    customizeNoCreatePermissionDialog: makeFunctionTemplate<CustomizeNoCreatePermissionDialog>(),
    getPublicGalleryEntry: makeFunctionTemplate<GetPublicGalleryEntry>(),
} as const;
