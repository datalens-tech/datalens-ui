import {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../components/CollectionFilters/CollectionFilters';

type CollectionContentProps = {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    getWorkbookActions: (item: WorkbookWithPermissions) => DropdownMenuItem[];
    getCollectionActions: (item: CollectionWithPermissions) => DropdownMenuItem[];
};

export {CollectionContentProps};
