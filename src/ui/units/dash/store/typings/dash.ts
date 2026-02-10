import type {DashKit, ItemParams} from '@gravity-ui/dashkit';
import type {
    DashData,
    DashDragOptions,
    DashEntry,
    EntryAnnotation,
    Permissions,
    WidgetType,
} from 'shared';
import type {DIALOG_TYPE} from 'ui/constants/dialogs';
import type {ValuesType} from 'utility-types';

import type {Mode} from '../../modules/constants';
import type {TabsHashStates} from '../../store/actions/dashTyped';
import type {DashUpdateStatus, GlobalItemWithId} from '../../typings/dash';

export type DashState = {
    tabId: null | string;
    lastModifiedItemId: null | string;
    hashStates?: null | TabsHashStates;
    stateHashId: null | string;
    initialTabsSettings?: null | DashData['tabs'];
    mode: Mode;
    navigationPath: null | string;
    dashKitRef: null | React.RefObject<DashKit>;
    error: null | Error;
    openedDialog: null | ValuesType<typeof DIALOG_TYPE>;
    openedItemId: string | null;
    showTableOfContent: boolean;
    lastUsedConnectionId: undefined | string;
    entry: DashEntry;
    data: DashData;
    annotation?: EntryAnnotation | null;
    updateStatus: DashUpdateStatus;
    convertedEntryData: DashData | null;
    permissions?: Permissions;
    lockToken: string | null;
    isFullscreenMode?: boolean;
    isLoadingEditMode: boolean;
    skipReload?: boolean;
    openedItemWidgetType?: WidgetType;
    // contains widgetId: currentTabId to open widget dialog with current tab
    widgetsCurrentTab: {[key: string]: string};
    dragOperationProps: DashDragOptions | null;
    openInfoOnLoad?: boolean;
};

export type UpdateTabsWithGlobalStateArgs = {
    params: ItemParams;
    selectorItem: GlobalItemWithId;
    appliedSelectorsIds: string[];
};
