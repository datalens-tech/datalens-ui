import React from 'react';

import type {
    AddConfigItem,
    Config,
    DashKit,
    ItemsStateAndParams,
    PluginTextProps,
    PluginTitleProps,
} from '@gravity-ui/dashkit';
import {i18n} from 'i18n';
import {DatalensGlobalState, URL_QUERY, sdk} from 'index';
import isEmpty from 'lodash/isEmpty';
import {
    type ConnectionQueryContent,
    type ConnectionQueryTypeOptions,
    ConnectionQueryTypeValues,
    DATASET_FIELD_TYPES,
    DashData,
    DashSettings,
    DashTab,
    DashTabItem,
    DashTabItemType,
    DashTabItemWidget,
    Dataset,
    DatasetFieldType,
    EntryUpdateMode,
    Operations,
    RecursivePartial,
    StringParams,
} from 'shared';
import {AppDispatch} from 'ui/store';
import {getLoginOrIdFromLockedError, isEntryIsLockedError} from 'utils/errors/errorByCode';

import {setLockedTextInfo} from '../../../../components/RevisionsPanel/RevisionsPanel';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {loadRevisions, setEntryContent} from '../../../../store/actions/entryContent';
import {showToast} from '../../../../store/actions/toaster';
import {EntryGlobalState, RevisionsMode} from '../../../../store/typings/entryContent';
import history from '../../../../utils/history';
import {DashTabChanged} from '../../containers/Dialogs/Tabs/TabItem';
import {ITEM_TYPE} from '../../containers/Dialogs/constants';
import {LOCK_DURATION, Mode} from '../../modules/constants';
import {collectDashStats} from '../../modules/pushStats';
import {DashUpdateStatus} from '../../typings/dash';
import * as actionTypes from '../constants/dashActionTypes';
import type {DashState} from '../reducers/dashTypedReducer';
import {selectIsControlSourceTypeHasChanged} from '../selectors/dashTypedSelectors';

import {save} from './base/actions';
import {
    getControlDefaultsForField,
    getControlValidation,
    getItemDataSource,
} from './controls/helpers';
import {ItemDataSource, SelectorDialogValidation, SelectorSourceType} from './controls/types';
import {closeDialog as closeDashDialog} from './dialogs/actions';
import {getBeforeCloseDialogItemAction, getExtendedItemDataAction} from './helpers';

import {DashDispatch} from './index';

type GetState = () => DatalensGlobalState;

export type TabsHashStates = {
    [key: string]: {
        hash: string;
        state: ItemsStateAndParams;
    };
};

export const SET_STATE = Symbol('dash/SET_STATE');
export type SetStateAction<T> = {
    type: typeof SET_STATE;
    payload: T;
};

export const cleanLock = (): SetStateAction<{lockToken: null}> => ({
    type: SET_STATE,
    payload: {lockToken: null},
});

export const setLock = (entryId: string, force = false, noEditMode = false) => {
    return async function (dispatch: DashDispatch) {
        const {lockToken} = await getSdk().us.createLock({
            entryId,
            data: {duration: LOCK_DURATION, force},
        });

        const payload: Partial<DashState> = {lockToken};
        if (!noEditMode) {
            payload.mode = Mode.Edit;
        }

        dispatch({
            type: SET_STATE,
            payload,
        });
    };
};

export const deleteLock = () => {
    return async function (dispatch: DashDispatch, getState: GetState): Promise<void> {
        const state = getState();

        if (!state.dash) {
            return;
        }

        const {lockToken, entry} = state.dash;

        const entryId = entry?.entryId || null;

        if (lockToken && entryId) {
            await getSdk()
                .us.deleteLock({
                    entryId: entryId,
                    params: {lockToken},
                })
                .then(() => {
                    dispatch(cleanLock());
                })
                .catch((error) => logger.logError('LOCK_DELETE', error));
        }
    };
};

export const SET_PAGE_TAB = Symbol('dash/SET_PAGE_TAB');
export type SetPageTabAction = {
    type: typeof SET_PAGE_TAB;
    payload: {
        tabId: string;
        hashStates?: TabsHashStates;
    };
};
export const setPageTab = (tabId: string) => {
    return async function (dispatch: DashDispatch, getState: GetState) {
        const {dash} = getState();

        collectDashStats({
            dashId: dash.entry.entryId,
            dashTabId: tabId,
            // resets when switching tabs
            dashStateHash: null,
        });

        dispatch({
            type: SET_PAGE_TAB,
            // TODO: if you pass null, then DashKit crashes
            payload: {tabId},
        });
    };
};

export const SET_INITIAL_PAGE_TABS_ITEMS = Symbol('dash/SET_INITIAL_PAGE_TABS_ITEMS');
export type SetInitialPageTabsItemsAction = {
    type: typeof SET_INITIAL_PAGE_TABS_ITEMS;
};

export function setInitialPageTabsItems() {
    return async (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        const {dash, entryContent} = getState();
        if (dash.initialTabsSettings) {
            return;
        }
        dispatch({
            type: SET_INITIAL_PAGE_TABS_ITEMS,
            payload: {
                dash,
                entryContent,
            },
        });
    };
}

export const SET_PAGE_TABS_ITEMS = Symbol('dash/SET_PAGE_TABS_ITEMS');
export type SetPageTabsItemsAction = {
    type: typeof SET_PAGE_TABS_ITEMS;
    payload: {
        tabId: string;
        items: Array<DashTabItem>;
    };
};

export const setPageTabsItems = ({
    tabId,
    items,
}: SetPageTabsItemsAction['payload']): SetPageTabsItemsAction => ({
    type: SET_PAGE_TABS_ITEMS,
    payload: {tabId, items},
});

export const SET_PAGE_DEFAULT_TAB_ITEMS = Symbol('dash/SET_PAGE_DEFAULT_TAB_ITEMS');
export type SetPageDefaultTabItemsAction = {
    type: typeof SET_PAGE_DEFAULT_TAB_ITEMS;
};

export const setPageDefaultTabItems = () => ({
    type: SET_PAGE_DEFAULT_TAB_ITEMS,
});

export const CHANGE_NAVIGATION_PATH = Symbol('dash/CHANGE_NAVIGATION_PATH');
export type ChangeNavigationPathAction = {
    type: typeof CHANGE_NAVIGATION_PATH;
    payload: {
        navigationPath: string;
    };
};
export const changeNavigationPath = (navigationPath: string): ChangeNavigationPathAction => ({
    type: CHANGE_NAVIGATION_PATH,
    payload: {navigationPath},
});

export const SET_DASHKIT_REF = Symbol('dash/SET_DASHKIT_REF');
export type SetDashKitRefAction = {
    type: typeof SET_DASHKIT_REF;
    payload: {
        dashKitRef: React.RefObject<DashKit>;
    };
};
export const setDashKitRef = (dashKitRef: React.RefObject<DashKit>): SetDashKitRefAction => ({
    type: SET_DASHKIT_REF,
    payload: {dashKitRef},
});

export const SET_HASH_STATE = Symbol('dash/SET_HASH_STATE');
export type SetHashStateAction = {
    type: typeof SET_HASH_STATE;
    payload: {
        hashStates: TabsHashStates;
        config: DashTab;
    };
};
export const setHashState = (hashStates: TabsHashStates, config: DashTab): SetHashStateAction => ({
    type: SET_HASH_STATE,
    payload: {hashStates, config},
});

export const SET_TAB_HASH_STATE = Symbol('dash/SET_TAB_HASH_STATE');
export type SetTabHashStateAction = {
    type: typeof SET_TAB_HASH_STATE;
    payload: {
        tabId: string;
        entryId: string | null;
        stateHashId?: string;
        hashStates?: TabsHashStates;
    };
};

export function setTabHashState(data: Omit<SetTabHashStateAction['payload'], 'hashStates'>) {
    return async (dispatch: DashDispatch) => {
        const {entryId, stateHashId, tabId} = data;
        const newData: SetTabHashStateAction['payload'] = {...data};

        if (stateHashId && entryId) {
            const hashData = await getSdk()
                .us.getDashState({entryId, hash: stateHashId})
                .catch((error) => logger.logError('getDashState failed', error));

            if (hashData) {
                /*const {
                    data: {controls, ...states},
                } = hashData;*/ // TODO to deal with controls with further typing of actions, apparently controls is no longer relevant

                newData.hashStates = {
                    [tabId]: {
                        hash: stateHashId,
                        // state: {...controls, ...states},
                        state: hashData.data,
                    },
                };
            }
        }

        dispatch({
            type: SET_TAB_HASH_STATE,
            payload: {
                ...newData,
            },
        });
    };
}

export const SET_STATE_HASH_ID = Symbol('dash/SET_STATE_HASH_ID');
export type SetStateHashIdAction = {
    type: typeof SET_STATE_HASH_ID;
    payload: {
        hash: string;
        tabId: string;
    };
};
export const setStateHashId = (data: SetStateHashIdAction['payload']): SetStateHashIdAction => ({
    type: SET_STATE_HASH_ID,
    payload: data,
});

export const SET_ERROR_MODE = Symbol('dash/SET_ERROR_MODE');
export type SetErrorModeAction = {
    type: typeof SET_ERROR_MODE;
    payload: {
        error: Error;
    };
};
export const setErrorMode = (error: Error): SetErrorModeAction => ({
    type: SET_ERROR_MODE,
    payload: {error},
});

export const TOGGLE_TABLE_OF_CONTENT = Symbol('dash/TOGGLE_TABLE_OF_CONTENT');
export type ToggleTableOfContentAction = {
    type: typeof TOGGLE_TABLE_OF_CONTENT;
    payload?: boolean;
};
export const toggleTableOfContent = (expanded?: boolean): ToggleTableOfContentAction => ({
    type: TOGGLE_TABLE_OF_CONTENT,
    payload: expanded,
});

export const SET_LAST_USED_DATASET_ID = Symbol('dash/SET_LAST_USED_DATASET_ID');
export type SetLastUsedDatasetIdAction = {
    type: typeof SET_LAST_USED_DATASET_ID;
    payload: string;
};

export const setLastUsedDatasetId = (datasetId: string): SetLastUsedDatasetIdAction => ({
    type: SET_LAST_USED_DATASET_ID,
    payload: datasetId,
});

export const SET_LAST_USED_CONNECTION_ID = Symbol('dash/SET_LAST_USED_CONNECTION_ID');
export type SetLastUsedConnectionIdAction = {
    type: typeof SET_LAST_USED_CONNECTION_ID;
    payload: string;
};

export const setLastUsedConnectionId = (connectionId: string): SetLastUsedConnectionIdAction => ({
    type: SET_LAST_USED_CONNECTION_ID,
    payload: connectionId,
});

type SetItemDataBase = {
    title?: string;
    sourceType?: string;
    autoHeight?: boolean;
    source?: ItemDataSource;
};
export type SetItemDataText = RecursivePartial<PluginTextProps['data']> & SetItemDataBase;
export type SetItemDataTitle = RecursivePartial<PluginTitleProps['data']> & SetItemDataBase;
export type SetItemDataDefaults = Record<string, string | string[]>;

export type SetItemDataArgs = {
    data: SetItemDataText | SetItemDataTitle;
    defaults?: SetItemDataDefaults;
    type?: string;
};

export const setItemData = (data: SetItemDataArgs) => ({
    type: actionTypes.SET_ITEM_DATA,
    payload: data,
});

export const SET_SELECTOR_DIALOG_ITEM = Symbol('dash/SET_SELECTOR_DIALOG_ITEM');

export type SelectorElementType = 'select' | 'date' | 'input' | 'checkbox';

export type SelectorDialogState = {
    title?: string;
    innerTitle?: string;
    sourceType?: SelectorSourceType;
    autoHeight?: boolean;
    chartId?: string;
    showTitle?: boolean;
    showInnerTitle?: boolean;
    elementType: SelectorElementType;
    defaultValue?: string | string[];
    dataset?: Dataset;
    datasetId?: string;
    connectionId?: string;
    selectorParameters?: StringParams;
    selectorParametersGroup?: number;
    connectionQueryType?: ConnectionQueryTypeValues;
    connectionQueryTypes?: ConnectionQueryTypeOptions[];
    connectionQueryContent?: ConnectionQueryContent;
    datasetFieldId?: string;
    fieldName?: string;
    acceptableValues?: AcceptableValue[];
    isRange?: boolean;
    multiselectable?: boolean;
    defaults: Record<string, string | string[]>;
    required?: boolean;
    useDefaultValue?: boolean;
    usePreset?: boolean;
    operation?: Operations;
    validation: SelectorDialogValidation;
    isManualTitle?: boolean;
    fieldType?: DATASET_FIELD_TYPES;
    datasetFieldType?: DatasetFieldType;
    placementMode: 'auto' | '%' | 'px';
    width: string;
    id?: string;
    namespace?: string;
};

export type AcceptableValue = {
    title: string;
    value: string;
};

export type SetSelectorDialogItemArgs = Partial<SelectorDialogState>;

export const setSelectorDialogItem = (payload: SetSelectorDialogItemArgs) => {
    return {
        type: SET_SELECTOR_DIALOG_ITEM,
        payload,
    };
};

export type SetSelectorDialogItemAction = {
    type: typeof SET_SELECTOR_DIALOG_ITEM;
    payload: SetSelectorDialogItemArgs;
};

export const applyControl2Dialog = () => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const selectorDialog = state.dash.selectorDialog as SelectorDialogState;
        const {title, sourceType, autoHeight} = selectorDialog;

        const validation = getControlValidation(selectorDialog);

        if (!isEmpty(validation)) {
            dispatch(
                setSelectorDialogItem({
                    validation,
                }),
            );
            return;
        }

        const hasChangedSourceType = selectIsControlSourceTypeHasChanged(state);
        const defaults = getControlDefaultsForField(selectorDialog, hasChangedSourceType);

        const data = {
            title,
            sourceType,
            autoHeight,
            source: getItemDataSource(selectorDialog),
        };
        const getExtendedItemData = getExtendedItemDataAction();
        const itemData = dispatch(getExtendedItemData({data, defaults}));

        dispatch(
            setItemData({
                data: itemData.data,
                type: DashTabItemType.Control,
                defaults: itemData.defaults,
            }),
        );

        dispatch(closeDashDialog());
    };
};

export const SET_DASH_VIEW_MODE = Symbol('dash/SET_DASH_VIEW_MODE');
export type SetViewModeAction = {
    type: typeof SET_DASH_VIEW_MODE;
    payload?: {
        mode: Mode;
    };
};
export const setDashViewMode = (payload?: SetViewModeAction['payload']): SetViewModeAction => ({
    type: SET_DASH_VIEW_MODE,
    payload,
});

export const SET_DASH_DESC_VIEW_MODE = Symbol('dash/SET_DASH_DESC_VIEW_MODE');
export type SetDescViewModeAction = {
    type: typeof SET_DASH_DESC_VIEW_MODE;
    payload?: Mode;
};
export const setDashDescViewMode = (
    payload?: SetDescViewModeAction['payload'],
): SetDescViewModeAction => ({
    type: SET_DASH_DESC_VIEW_MODE,
    payload,
});

export const SET_DASH_DESCRIPTION = Symbol('dash/SET_DASH_DESCRIPTION');
export type SetDescriptionAction = {
    type: typeof SET_DASH_DESCRIPTION;
    payload?: string;
};
export const setDashDescription = (
    payload?: SetDescriptionAction['payload'],
): SetDescriptionAction => ({
    type: SET_DASH_DESCRIPTION,
    payload,
});

export const SET_DASH_ACCESS_DESCRIPTION = Symbol('dash/SET_DASH_ACCESS_DESCRIPTION');
export type SetAccessDescriptionAction = {
    type: typeof SET_DASH_ACCESS_DESCRIPTION;
    payload?: string;
};
export const setDashAccessDescription = (
    payload?: SetAccessDescriptionAction['payload'],
): SetAccessDescriptionAction => ({
    type: SET_DASH_ACCESS_DESCRIPTION,
    payload,
});

export const SET_DASH_SUPPORT_DESCRIPTION = Symbol('dash/SET_DASH_SUPPORT_DESCRIPTION');
export type SetSupportDescriptionAction = {
    type: typeof SET_DASH_SUPPORT_DESCRIPTION;
    payload?: string;
};
export const setDashSupportDescription = (
    payload?: SetSupportDescriptionAction['payload'],
): SetSupportDescriptionAction => ({
    type: SET_DASH_SUPPORT_DESCRIPTION,
    payload,
});

export const SET_LOADING_EDIT_MODE = Symbol('dash/SET_LOADING_EDIT_MODE');
export type SetLoadingEditModeAction = {
    type: typeof SET_LOADING_EDIT_MODE;
    payload?: boolean;
};
export const setLoadingEditMode = (
    payload?: SetLoadingEditModeAction['payload'],
): SetLoadingEditModeAction => ({
    type: SET_LOADING_EDIT_MODE,
    payload,
});

export const SET_DASH_UPDATE_STATUS = Symbol('dash/SET_DASH_UPDATE_STATUS');
export type SetDashUpdateStatusAction = {
    type: typeof SET_DASH_UPDATE_STATUS;
    payload: DashUpdateStatus;
};
export const setDashUpdateStatus = (
    payload: SetDashUpdateStatusAction['payload'],
): SetDashUpdateStatusAction => ({
    type: SET_DASH_UPDATE_STATUS,
    payload,
});

enum DashSaveActionType {
    SetActualDash = 'setActualDash',
    SetPublishDraft = 'setPublishDraft',
    SaveDashAsDraft = 'saveDashAsDraft',
}
function saveFailedCallback({
    error,
    dispatch,
    saveActionType,
    getState,
}: {
    error: Error;
    dispatch: DashDispatch;
    saveActionType?: DashSaveActionType;
    getState: () => DatalensGlobalState;
}) {
    if (isEntryIsLockedError(error)) {
        const {entryContent} = getState();
        dispatch(setDashUpdateStatus(DashUpdateStatus.Failed));
        dispatch(
            setLockedTextInfo({
                loginOrId: getLoginOrIdFromLockedError(error),
                scope: entryContent.scope,
                callback: () => {
                    switch (saveActionType) {
                        case DashSaveActionType.SetActualDash:
                            dispatch(setActualDash(true));
                            break;
                        case DashSaveActionType.SetPublishDraft:
                            dispatch(setPublishDraft(true));
                            break;
                        case DashSaveActionType.SaveDashAsDraft:
                            dispatch(saveDashAsDraft(true));
                            break;
                    }
                },
                onError: ({title, name, error: errorApply}) => {
                    dispatch(
                        showToast({
                            title,
                            name,
                            error: errorApply,
                            withReport: true,
                        }),
                    );
                },
            }),
        );
        throw new Error('The entry is locked');
    }

    dispatch(
        showToast({
            error,
            title: i18n('dash.store.view', 'label_unexpected-error'),
        }),
    );
}

export function setActualDash(setForce?: boolean) {
    return async (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        const {dash} = getState();
        const isEditMode = dash.mode !== Mode.Edit;

        try {
            dispatch(setLoadingEditMode(true));
            dispatch(setDashUpdateStatus(DashUpdateStatus.Loading));
            if (isEditMode) {
                await dispatch(setLock(dash.entry.entryId, setForce || false, true));
            }
            await dispatch(save(EntryUpdateMode.Publish));
            dispatch(setDashUpdateStatus(DashUpdateStatus.Successed));
            if (isEditMode) {
                await dispatch(deleteLock());
            }
            const searchParams = new URLSearchParams(location.search);
            searchParams.delete(URL_QUERY.REV_ID);
            history.push({
                ...location,
                search: `?${searchParams.toString()}`,
            });

            const newState = getState();
            await dispatch(setEntryContent(newState.dash.entry as unknown as EntryGlobalState));

            const {entryContent} = newState;
            if (entryContent.revisionsMode === RevisionsMode.Opened) {
                // reloading the list of versions
                await dispatch(
                    loadRevisions({
                        entryId: entryContent.entryId,
                        page: 0,
                    }),
                );
            }
        } catch (error) {
            saveFailedCallback({
                error,
                dispatch,
                saveActionType: DashSaveActionType.SetActualDash,
                getState,
            });
        } finally {
            dispatch(setLoadingEditMode(false));
        }
        return null;
    };
}

export function setPublishDraft(setForce?: boolean) {
    return async (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        try {
            dispatch(setLoadingEditMode(true));
            dispatch(setDashUpdateStatus(DashUpdateStatus.Loading));
            const {dash} = getState();
            await dispatch(setLock(dash.entry.entryId, setForce || false, true));
            await dispatch(save(EntryUpdateMode.Publish, true));
            await dispatch(deleteLock());
            dispatch(setDashUpdateStatus(DashUpdateStatus.Successed));

            const searchParams = new URLSearchParams(location.search);
            searchParams.delete(URL_QUERY.REV_ID);
            history.push({
                ...location,
                search: `?${searchParams.toString()}`,
            });

            const newState = getState();
            await dispatch(setEntryContent(newState.dash.entry as unknown as EntryGlobalState));

            const {entryContent} = newState;
            if (entryContent.revisionsMode === RevisionsMode.Opened) {
                // reloading the list of versions
                await dispatch(
                    loadRevisions({
                        entryId: entryContent.entryId,
                        page: 0,
                    }),
                );
            }
        } catch (error) {
            saveFailedCallback({
                error,
                dispatch,
                saveActionType: DashSaveActionType.SetPublishDraft,
                getState,
            });
        } finally {
            dispatch(setLoadingEditMode(false));
        }
        return null;
    };
}

export function saveDashAsDraft(setForce?: boolean) {
    return async (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        const {dash} = getState();
        const isEditMode = dash.mode !== Mode.Edit;

        try {
            dispatch(setLoadingEditMode(true));
            dispatch(setDashUpdateStatus(DashUpdateStatus.Loading));
            if (isEditMode) {
                await dispatch(setLock(dash.entry.entryId, setForce || false, true));
            }
            await dispatch(save(EntryUpdateMode.Save));
            dispatch(setDashUpdateStatus(DashUpdateStatus.Successed));
            if (isEditMode) {
                await dispatch(deleteLock());
            }

            const newState = getState();
            await dispatch(setEntryContent(newState.dash.entry as unknown as EntryGlobalState));
            const searchParams = new URLSearchParams(location.search);
            searchParams.set(URL_QUERY.REV_ID, newState.dash.entry.savedId);
            history.push({
                ...location,
                search: `?${searchParams.toString()}`,
            });
        } catch (error) {
            saveFailedCallback({
                error,
                dispatch,
                saveActionType: DashSaveActionType.SaveDashAsDraft,
                getState,
            });
        } finally {
            dispatch(setLoadingEditMode(false));
        }
        return null;
    };
}

export function purgeData(data: DashData) {
    const allTabsIds = new Set();
    const allItemsIds = new Set();
    const allWidgetTabsIds = new Set();

    return {
        ...data,
        tabs: data.tabs.map((tab) => {
            const {id: tabId, items: tabItems, layout, connections, aliases} = tab;

            const currentItemsIds = new Set();
            const currentWidgetTabsIds = new Set();
            const currentControlsIds = new Set();

            allTabsIds.add(tabId);

            const resultItems = tabItems
                // there are empty data
                .filter((item) => !isEmpty(item.data))
                .map((item) => {
                    const {id: itemId, type, data} = item;

                    allItemsIds.add(itemId);
                    currentItemsIds.add(itemId);

                    if (type === ITEM_TYPE.CONTROL || type === ITEM_TYPE.GROUP_CONTROL) {
                        // if it is group control all connections set on its group items
                        if ('group' in data) {
                            data.group.forEach((widgetItem) => {
                                currentControlsIds.add(widgetItem.id);
                            });
                        } else {
                            currentControlsIds.add(itemId);
                        }
                    } else if (type === ITEM_TYPE.WIDGET) {
                        (data as DashTabItemWidget['data']).tabs.forEach(({id: widgetTabId}) => {
                            allWidgetTabsIds.add(widgetTabId);
                            currentWidgetTabsIds.add(widgetTabId);
                        });
                    }

                    return item;
                });

            return {
                ...tab,
                items: resultItems,
                // since items is filtered above, then layout needs to be filtered as well.
                layout: layout.filter(({i}) => currentItemsIds.has(i)),
                connections: connections.filter(
                    ({from, to}) =>
                        // connections can only have elements with from or to
                        from &&
                        to &&
                        // there may be elements in connections that are no longer in items
                        (currentControlsIds.has(from) || currentWidgetTabsIds.has(from)) &&
                        (currentControlsIds.has(to) || currentWidgetTabsIds.has(to)),
                ),
                aliases: Object.entries(aliases).reduce<typeof aliases>((result, [key, value]) => {
                    result[key] = value
                        // the array of aliases can be null
                        .map((alias) => alias.filter(Boolean))
                        // there may be less than 2 elements in the alias array
                        .filter((alias) => alias.length > 1);
                    return result;
                }, {}),
            };
        }),
    };
}

export type SaveAsNewDashArgs = {
    key?: string;
    workbookId?: string;
    name?: string;
};

export function saveDashAsNewDash({key, workbookId, name}: SaveAsNewDashArgs) {
    return async (dispatch: DashDispatch, getState: () => DatalensGlobalState) => {
        const {dash} = getState();

        try {
            const res = await sdk.charts.createDash({
                data: {
                    data: purgeData(dash.data),
                    key,
                    mode: EntryUpdateMode.Publish,
                    withParams: true,
                    workbookId,
                    name,
                },
            });
            dispatch(setDashViewMode({mode: Mode.View}));
            return res;
        } catch (error) {
            saveFailedCallback({
                error,
                dispatch,
                getState,
            });
        }
        return null;
    };
}

export const setTabs = (tabs: DashTabChanged[]) => ({
    type: actionTypes.SET_TABS,
    payload: tabs,
});

export const setCurrentTabData = (data: Config) => ({
    type: actionTypes.SET_CURRENT_TAB_DATA,
    payload: data,
});

export const updateCurrentTabData = (data: {
    aliases?: DashTab['aliases'];
    connections?: Config['connections'];
}) => ({
    type: actionTypes.UPDATE_CURRENT_TAB_DATA,
    payload: data,
});

export const setSettings = (settings: DashSettings) => ({
    type: actionTypes.SET_SETTINGS,
    payload: settings,
});

export const setCopiedItemData = (data: AddConfigItem) => ({
    type: actionTypes.SET_COPIED_ITEM_DATA,
    payload: {
        data,
    },
});

export const setDefaultViewState = () => {
    return (dispatch: AppDispatch) => {
        dispatch(setDashViewMode());
        dispatch(setPageDefaultTabItems());
    };
};

export const SET_DASH_KEY = Symbol('dash/SET_DASH_KEY');
export type SetDashKeyAction = {
    type: typeof SET_DASH_KEY;
    payload: string;
};
export const renameDash = (key: string): SetDashKeyAction => ({
    type: SET_DASH_KEY,
    payload: key,
});

export const SET_RENAME_WITHOUT_RELOAD = Symbol('dash/SET_RENAME_WITHOUT_RELOAD');
export type SetRenameWithoutReloadAction = {
    type: typeof SET_RENAME_WITHOUT_RELOAD;
    payload: boolean;
};
export const setRenameWithoutReload = (
    isRenameWithoutReload: boolean,
): SetRenameWithoutReloadAction => ({
    type: SET_RENAME_WITHOUT_RELOAD,
    payload: isRenameWithoutReload,
});

export const SET_SKIP_RELOAD = Symbol('dash/SET_SKIP_RELOAD');
export type SetSkipReloadAction = {
    type: typeof SET_SKIP_RELOAD;
    payload: boolean;
};
export const setSkipReload = (skipReload: boolean): SetSkipReloadAction => ({
    type: SET_SKIP_RELOAD,
    payload: skipReload,
});

export type SetWidgetCurrentTabArgs = {
    widgetId: string;
    tabId: string;
};
export const SET_WIDGET_CURRENT_TAB = Symbol('dash/SET_WIDGET_CURRENT_TAB');
export type SetWidgetCurrentTabAction = {
    type: typeof SET_WIDGET_CURRENT_TAB;
    payload: SetWidgetCurrentTabArgs;
};
export const setWidgetCurrentTab = (
    payload: SetWidgetCurrentTabArgs,
): SetWidgetCurrentTabAction => ({
    type: SET_WIDGET_CURRENT_TAB,
    payload,
});

export const closeControl2Dialog = () => {
    return (dispatch: AppDispatch) => {
        const beforeCloseDialogItem = getBeforeCloseDialogItemAction();
        dispatch(beforeCloseDialogItem());
        dispatch(closeDashDialog());
    };
};
