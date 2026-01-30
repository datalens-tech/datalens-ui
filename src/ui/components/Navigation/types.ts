import type {ReactNode} from 'react';

import type {IconData} from '@gravity-ui/uikit';
import type {DLUserSettings} from 'shared';

import type {EntryFields, NavigationEntry} from '../../../shared/schema';

import type {CreateMenuValue} from './Core/CreateEntry/CreateEntry';
import type {MODE_FULL, MODE_MINIMAL, MODE_MODAL} from './constants';

export type Mode = typeof MODE_MINIMAL | typeof MODE_FULL | typeof MODE_MODAL;

export type ResolvePathMode = 'key' | 'id' | 'place';

export type CurrentPageEntry = Partial<Omit<EntryFields, 'key' | 'entryId'>> & {
    key: string;
    entryId: string;
};

export type PlaceParameterItem = {
    place: string;
    icon: IconData;
    text: string;
    buttonText: string;
    value: CreateMenuValue;
    displayParentFolder: boolean;
    filters: {
        ownership: boolean;
        order: boolean;
    };
    iconClassName?: string;
    qa?: string;
};

export type LinkWrapperEntry = NavigationEntry | PlaceParameterItem;

export type LinkWrapperArgs = {
    entry: LinkWrapperEntry;
    children: ReactNode;
    className?: string;
};

export type MenuClickArgs = {
    entry: {entryId: string; displayAlias?: string | null};
    action: string;
};

export type ItemSelectArgs = {
    selectedItemId?: string;
    selectedItemsIds: Set<string>;
};

export type BatchAction = 'move';

export type ChangeLocation = (place: string, path: string) => void;

export type FilterOrderByField = NonNullable<DLUserSettings['dlNavFilterOrderByField']>;
export type FilterOrderByDirection = NonNullable<DLUserSettings['dlNavFilterOrderByDirection']>;
export type FilterCreatedBy = NonNullable<DLUserSettings['dlNavFilterCreatedBy']>;
