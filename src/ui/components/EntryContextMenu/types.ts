import {IconData} from '@gravity-ui/uikit';
import type {Permissions} from 'shared';
import type {GetEntryResponse} from 'shared/schema';

export type ContextMenuParams = {
    entry?: GetEntryResponse & {fake?: boolean};
    showSpecificItems: boolean;
    isEditMode: boolean | string;
    isLimitedView: boolean;
};

export type ContextMenuItem = {
    id: string;
    action?: string | (() => void | Promise<void>);
    icon: IconData;
    text: string;
    /**
     * enable need to be function for correct getting value in tests
     */
    enable: () => boolean;
    permissions?: Permissions | ((entry?: ContextMenuParams['entry']) => Permissions | undefined);
    scopes: Array<string>;
    isSpecific?: boolean;
    isOnEditMode?: boolean;
    isStrictPermissions?: boolean;
    isVisible?: (params: ContextMenuParams) => boolean;
    qa?: string;
};
