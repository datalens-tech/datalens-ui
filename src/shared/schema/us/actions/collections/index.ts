import {createCollection} from './create-collection';
import {deleteCollection} from './delete-collection';
import {deleteCollections} from './delete-collections';
import {getCollection} from './get-collection';
import {getCollectionBreadcrumbs} from './get-collection-breadcrumbs';
import {getRootCollectionPermissions} from './get-root-collection-permissions';
import {getStructureItems} from './get-structure-items';
import {moveCollection} from './move-collection';
import {moveCollections} from './move-collections';
import {updateCollection} from './update-collection';

export const collectionsActions = {
    getRootCollectionPermissions,
    createCollection,
    getCollection,
    getStructureItems,
    getCollectionBreadcrumbs,
    deleteCollection,
    updateCollection,
    moveCollection,
    moveCollections,
    deleteCollections,
};
