import {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions, WorkbookWithPermissions} from 'shared/schema';

import {CollectionContentFilters} from '../../../components/CollectionFilters/CollectionFilters';

export type SelectedMap = Record<string, 'workbook' | 'collection'>;

export type UpdateCheckbox = (
    entityId: string,
    type: 'workbook' | 'collection',
    checked: boolean,
) => void;

export interface ContentProps {
    contentItems: (CollectionWithPermissions | WorkbookWithPermissions)[];
    filters: CollectionContentFilters;
    onUpdateCheckbox: UpdateCheckbox;
    onSelectAll: (checked: boolean) => void;
    selectedMap: SelectedMap;
    countItemsWithPermissionMove: number;
    countSelected: number;
    isOpenSelectionMode: boolean;
    canMove: boolean;
}

interface CollectionContentProps extends ContentProps {
    getWorkbookActions: (
        item: WorkbookWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
    getCollectionActions: (
        item: CollectionWithPermissions,
    ) => (DropdownMenuItem[] | DropdownMenuItem)[];
}

type CollectionContentGridProps = Omit<
    CollectionContentProps,
    'countSelected' | 'canMove' | 'filters'
>;

type CollectionContentTableProps = Omit<CollectionContentProps, 'isOpenSelectionMode' | 'filters'>;

export {CollectionContentGridProps, CollectionContentTableProps};
