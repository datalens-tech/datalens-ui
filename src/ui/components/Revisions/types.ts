import type {DropdownMenuItemMixed} from '@gravity-ui/uikit';

import type {GetRevisionsEntry} from '../../../shared/schema';

export type RevisionEntry = GetRevisionsEntry;

export type RevisionsListItems = Record<string, Array<GetRevisionsEntry>>;

export type RevisionsStatuses = 'published' | 'draft' | null;

export type RevisionsGroupedDates = {
    date: string;
    dayItems: Array<GetRevisionsEntry>;
};

interface RevisionRowExtendedProps {
    disabled?: boolean;
    disabledText?: string;
}

export type GetRevisionRowExtendedProps = (item: GetRevisionsEntry) => RevisionRowExtendedProps;

export type GetRevisionMenuItems = (
    defaultItems: DropdownMenuItemMixed<unknown>[],
    item: GetRevisionsEntry,
) => DropdownMenuItemMixed<unknown>[];
