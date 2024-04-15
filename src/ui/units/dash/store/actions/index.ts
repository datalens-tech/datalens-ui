import {ThunkDispatch} from 'redux-thunk';
import {DatalensGlobalState} from 'ui';

import {EntryContentAction} from '../../../../store/actions/entryContent';

import {
    AddSelectorToGroupAction,
    SetActiveSelectorIndexAction,
    UpdateSelectorsGroupAction,
} from './controls/actions';
import {SaveDashErrorAction, SaveDashSuccessAction} from './dash';
import {
    ChangeNavigationPathAction,
    SetAccessDescriptionAction,
    SetDashKeyAction,
    SetDashKitRefAction,
    SetDashUpdateStatusAction,
    SetDescViewModeAction,
    SetDescriptionAction,
    SetErrorModeAction,
    SetHashStateAction,
    SetInitialPageTabsItemsAction,
    type SetLastUsedConnectionIdAction,
    SetLastUsedDatasetIdAction,
    SetLoadingEditModeAction,
    SetPageDefaultTabItemsAction,
    SetPageTabAction,
    SetPageTabsItemsAction,
    SetRenameWithoutReloadAction,
    SetSelectorDialogItemAction,
    SetSkipReloadAction,
    SetStateAction,
    SetStateHashIdAction,
    SetSupportDescriptionAction,
    SetTabHashStateAction,
    SetViewModeAction,
    SetWidgetCurrentTabAction,
    ToggleTableOfContentAction,
} from './dashTyped';
import {CloseDialogAction, OpenDialogAction, OpenItemDialogAction} from './dialogs/actions';
import {SetNewRelationsAction} from './relations/actions';

export type DashAction<T = unknown> =
    | SetStateAction<T>
    | SetPageTabAction
    | SetPageTabsItemsAction
    | SetInitialPageTabsItemsAction
    | SetPageDefaultTabItemsAction
    | ChangeNavigationPathAction
    | SetDashKitRefAction
    | SetHashStateAction
    | SetTabHashStateAction
    | SetStateHashIdAction
    | SetErrorModeAction
    | ToggleTableOfContentAction
    | SetLastUsedDatasetIdAction
    | SetSelectorDialogItemAction
    | AddSelectorToGroupAction
    | UpdateSelectorsGroupAction
    | SetViewModeAction
    | SetDescViewModeAction
    | SetDescriptionAction
    | SetAccessDescriptionAction
    | SetSupportDescriptionAction
    | SetLoadingEditModeAction
    | EntryContentAction
    | SetDashUpdateStatusAction
    | SetNewRelationsAction
    | SetDashKeyAction
    | SetRenameWithoutReloadAction
    | SetActiveSelectorIndexAction
    | SetSkipReloadAction
    | SetWidgetCurrentTabAction
    | OpenDialogAction
    | OpenItemDialogAction
    | CloseDialogAction
    | SaveDashSuccessAction
    | SaveDashErrorAction
    | SetLastUsedConnectionIdAction;

export type DashDispatch = ThunkDispatch<DatalensGlobalState, void, DashAction>;
