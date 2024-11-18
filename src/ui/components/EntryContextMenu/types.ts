import type {IconData} from '@gravity-ui/uikit';
import type {Permissions} from 'shared';
import type {EntryFields, GetEntryResponse} from 'shared/schema';

export type ContextMenuParams = {
    entry?: GetEntryResponse & {fake?: boolean};
    showSpecificItems: boolean;
    isEditMode: boolean | string;
    isLimitedView: boolean;
    place?: string;
};

export type ContextMenuItem = {
    id: string;
    action?: string | (() => void | Promise<void>);
    icon: IconData;
    text: string;
    /**
     * enable need to be function for correct getting value in tests
     */
    enable: (entry:GetEntryResponse | undefined) => boolean;
    permissions?: Permissions | ((entry?: ContextMenuParams['entry']) => Permissions | undefined);
    scopes: Array<string>;
    isSpecific?: boolean;
    isOnEditMode?: boolean;
    place?: string;
    isStrictPermissions?: boolean;
    isVisible?: (params: ContextMenuParams) => boolean;
    qa?: string;
};

export interface MenuEntry {
    entryId: string;
    key: string;
    scope: string;
    name?: string;
    workbookId: EntryFields['workbookId'];
}
