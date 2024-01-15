import {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../components/CollectionFilters/CollectionFilters';

export type SelectedMap = Record<
    string,
    {
        type: 'workbook' | 'collection';
        checked: boolean;
    }
>;

export type UpdateCheckbox = (
    checked: boolean,
    type: 'workbook' | 'collection',
    entityId: string,
) => void;

export interface ContentProps {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    setFilters: (filters: CollectionContentFilters) => void;
    onUpdateCheckbox: UpdateCheckbox;
    onSelectAll: (checked: boolean) => void;
    selectedMap: SelectedMap;
    countItemsWithPermissionMove: number;
    countSelected: number;
    isOpenSelectionMode: boolean;
    isСanMove: boolean;
}

interface CollectionContentProps extends ContentProps {
    getWorkbookActions: (
        item: WorkbookWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    getCollectionActions: (
        item: CollectionWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
}

type CollectionContentGridProps = Omit<CollectionContentProps, 'countSelected' | 'isСanMove'>;

type CollectionContentTableProps = Omit<CollectionContentProps, 'isOpenSelectionMode'>;

export {CollectionContentGridProps, CollectionContentTableProps};
