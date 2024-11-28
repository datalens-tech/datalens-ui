import type {DropdownMenuItem} from '@gravity-ui/uikit';
import type {CollectionWithPermissions} from 'shared/schema/us/types/collections';
import type {WorkbookWithPermissions} from 'shared/schema/us/types/workbooks';

import type {CustomizeEmptyPlaceholder} from '../../../../registry/units/collections/types';

export const customizeCollectionsActions = (
    _item: CollectionWithPermissions,
    actions: (DropdownMenuItem[] | DropdownMenuItem)[],
) => actions;

export const customizeWorkbooksActions = (
    _item: WorkbookWithPermissions,
    actions: (DropdownMenuItem[] | DropdownMenuItem)[],
) => actions;

export const customizeEmptyPlaceholder: CustomizeEmptyPlaceholder = ({
    title,
    description,
    actions,
}) => {
    return {title, description, actions};
};
