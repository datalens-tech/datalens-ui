import type {CollectionWithOptionalPermissions, WorkbookWithPermissions} from 'shared/schema';

import {COLLECTIONS_PATH} from '../constants';

export const getParentCollectionPath = (
    entity: CollectionWithOptionalPermissions | WorkbookWithPermissions,
) => {
    const parentId = 'parentId' in entity ? entity.parentId : entity.collectionId;

    return parentId ? `${COLLECTIONS_PATH}/${parentId}` : COLLECTIONS_PATH;
};
