import {ThunkDispatch} from 'redux-thunk';
import {DatalensGlobalState} from 'ui';

import {EntryContentAction} from '../../../../store/actions/entryContent';

import {
    AddSelectorToGroupAction,
    ChangeNavigationPathAction,
    SetAccessDescriptionAction,
    SetActiveSelectorIndexAction,
    SetDashKeyAction,
    SetDashKitRefAction,
    SetDashUpdateStatusAction,
    SetDescViewModeAction,
    SetDescriptionAction,
    SetErrorModeAction,
    SetHashStateAction,
    SetInitialPageTabsItemsAction,
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
    UpdateSelectorsGroupAction,
} from './dashTyped';
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
    | SetWidgetCurrentTabAction;

export type DashDispatch = ThunkDispatch<DatalensGlobalState, void, DashAction>;
