import type {NavigationEntry} from '../../../../../shared/schema';
import {ChangeLocation, CurrentPageEntry, LinkWrapperArgs, MenuClickArgs, Mode} from '../../types';
import {checkEntryActivity} from '../../util';
import {EntryContextButtonProps} from '../EntryContextButton/EntryContextButton';

export type ParentFolderEntry = {
    scope: 'folder';
    key: string;
    name: string;
    parent: true;
};

export type TableViewProps = {
    mode: Mode;
    place: string;
    entries: NavigationEntry[];
    displayParentFolder: boolean;
    onCloseEntryContextMenu: () => void;
    onLoadMore: () => void;
    onEntryContextClick: EntryContextButtonProps['onClick'];
    onChangeFavorite: (entry: NavigationEntry) => void;
    refreshNavigation: () => void;
    onChangeLocation: ChangeLocation;
    currentEntryContext?: NavigationEntry | null;
    currentPageEntry?: CurrentPageEntry;
    clickableScope?: string;
    inactiveEntryKeys?: string[];
    inactiveEntryIds?: string[];
    checkEntryActivity?: ReturnType<typeof checkEntryActivity>;
    onEntryClick?: (
        entry: NavigationEntry,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => void;
    onEntryParentClick?: (
        parentEnty: ParentFolderEntry,
        event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    ) => void;
    linkWrapper?: (args: LinkWrapperArgs) => React.ReactNode;
    loading?: boolean;
    hasNextPage?: boolean;
    isMobileNavigation?: boolean;
    onMenuClick?: (args: MenuClickArgs) => void;
};

export type HookBatchSelectResult = {
    selectedIds: Set<string>;
    isBatchEnabled: boolean;
    onEntrySelect: (entryId: string) => void;
    isAllCheckBoxChecked: boolean;
    onAllCheckBoxSelect: () => void;
    resetSelected: () => void;
};
