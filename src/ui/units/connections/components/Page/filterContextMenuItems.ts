import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';
import type {EntryContextMenuItem} from 'ui/components/EntryContextMenu/helpers';

import {HiddenContextsForSharedEntry, HiddenContextsForWorkbookSharedEntry} from './constants';

type FilterMenuItemsProps = {
    items: EntryContextMenuItem[];
    isSharedConnection?: boolean;
    revisionsSupported?: boolean;
    isWorkbookSharedEntry: boolean;
};

export const filterMenuItems = ({
    items,
    isSharedConnection,
    revisionsSupported,
    isWorkbookSharedEntry,
}: FilterMenuItemsProps) => {
    return items.filter((item) => {
        if (isWorkbookSharedEntry && HiddenContextsForWorkbookSharedEntry.has(item.id)) {
            return false;
        }
        if (isSharedConnection && HiddenContextsForSharedEntry.has(item.id)) {
            return false;
        }
        if (!revisionsSupported && item.id === ENTRY_CONTEXT_MENU_ACTION.REVISIONS) {
            return false;
        }
        return true;
    });
};
