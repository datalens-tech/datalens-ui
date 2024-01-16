import React from 'react';

import {DashKit, ItemsStateAndParams} from '@gravity-ui/dashkit';
import {PluginTextProps} from '@gravity-ui/dashkit/build/esm/plugins/Text/Text';
import {PluginTitleProps} from '@gravity-ui/dashkit/build/esm/plugins/Title/Title';
import {i18n} from 'i18n';
import {DatalensGlobalState, URL_QUERY, sdk} from 'index';
import isEmpty from 'lodash/isEmpty';
import {
    DATASET_FIELD_TYPES,
    DashTab,
    DashTabItem,
    DashTabItemControlSourceType,
    Dataset,
    DatasetFieldType,
    EntryUpdateMode,
    Operations,
} from 'shared';
import {AppDispatch} from 'ui/store';
import {validateParamTitleOnlyUnderscore} from 'units/dash/components/ParamsSettings/helpers';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import {addOperationForValue} from 'units/dash/modules/helpers';
import {getLoginOrIdFromLockedError, isEntryIsLockedError} from 'utils/errors/errorByCode';

import {setLockedTextInfo} from '../../../../components/RevisionsPanel/RevisionsPanel';
import logger from '../../../../libs/logger';
import {getSdk} from '../../../../libs/schematic-sdk';
import {loadRevisions, setEntryContent} from '../../../../store/actions/entryContent';
import {showToast} from '../../../../store/actions/toaster';
import {EntryGlobalState, RevisionsMode} from '../../../../store/typings/entryContent';
import history from '../../../../utils/history';
import {Mode} from '../../modules/constants';
import {collectDashStats} from '../../modules/pushStats';
import {DashUpdateStatus} from '../../typings/dash';
import * as actionTypes from '../constants/dashActionTypes';

import {closeDialog as closeDashDialog, deleteLock, purgeData, save, setLock} from './dash';
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

type ItemDataSource = {
    chartId?: string;
    showTitle?: boolean;
    elementType?: string;
    defaultValue?: string | string[];
    datasetId?: string;
    datasetFieldId?: string;
    fieldName?: string;
    fieldType?: DATASET_FIELD_TYPES;
    datasetFieldType?: DatasetFieldType;
    acceptableValues?: Array<Record<string, any>>;
    isRange?: boolean;
    multiselectable?: boolean;
    operation?: Operations;
    showInnerTitle?: boolean;
    innerTitle?: string;
};

type SetItemDataBase = {
    title?: string;
    sourceType?: string;
    autoHeight?: boolean;
    source?: ItemDataSource;
};
export type SetItemDataText = Partial<PluginTextProps['data']> & SetItemDataBase;
export type SetItemDataTitle = Partial<PluginTitleProps['data']> & SetItemDataBase;
export type SetItemDataDefaults = Record<string, string | string[]>;

export type SetItemDataArgs = {
    data: SetItemDataText | SetItemDataTitle;
    defaults?: SetItemDataDefaults;
};

export const setItemData = (data: SetItemDataArgs) => ({
    type: actionTypes.SET_ITEM_DATA,
    payload: data,
});

export const SET_SELECTOR_DIALOG_ITEM = Symbol('dash/SET_SELECTOR_DIALOG_ITEM');

export const ADD_SELECTOR_TO_GROUP = Symbol('dash/ADD_SELECTOR_TO_GROUP');

export const UPDATE_SELECTORS_GROUP = Symbol('dash/UPDATE_SELECTORS_GROUP');

export const SET_ACTIVE_SELECTOR_INDEX = Symbol('dash/SET_ACTIVE_SELECTOR)INDEX');

export type SelectorSourceType = 'dataset' | 'manual' | 'external';

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
    datasetFieldId?: string;
    fieldName?: string;
    acceptableValues?: AcceptableValue[];
    isRange?: boolean;
    multiselectable?: boolean;
    defaults: Record<string, string | string[]>;
    useDefaultValue?: boolean;
    usePreset?: boolean;
    operation?: Operations;
    validation: SelectorDialogValidation;
    isManualTitle?: boolean;
    fieldType?: DATASET_FIELD_TYPES;
    datasetFieldType?: DatasetFieldType;
    placementMode: 'auto' | '%' | 'px';
    width: string;
    id: string;
};

type SelectorDialogValidation = {
    title?: string;
    fieldName?: string;
    datasetFieldId?: string;
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

export const addSelectorToGroup = (payload: SetSelectorDialogItemArgs) => {
    return {
        type: ADD_SELECTOR_TO_GROUP,
        payload,
    };
};

export type AddSelectorToGroupAction = {
    type: typeof ADD_SELECTOR_TO_GROUP;
    payload: SetSelectorDialogItemArgs;
};

export type SetActiveSelectorIndexAction = {
    type: typeof SET_ACTIVE_SELECTOR_INDEX;
    payload: number;
};

export const setActiveSelectorIndex = (payload: number) => {
    return {
        type: SET_ACTIVE_SELECTOR_INDEX,
        payload,
    };
};

export const updateSelectorsGroup = (payload: SelectorDialogState[]) => {
    return {
        type: UPDATE_SELECTORS_GROUP,
        payload,
    };
};

export type UpdateSelectorsGroupAction = {
    type: typeof UPDATE_SELECTORS_GROUP;
    payload: SelectorDialogState[];
};

const getItemDataSource = (selectorDialog: SelectorDialogState): ItemDataSource => {
    const {
        sourceType,

        showTitle,
        showInnerTitle,
        innerTitle,
        elementType,
        multiselectable,
        isRange,
        defaultValue,

        datasetId,
        datasetFieldId,
        fieldType,
        datasetFieldType,
        fieldName,
        acceptableValues,

        chartId,
        operation,
    } = selectorDialog;

    if (sourceType === DashTabItemControlSourceType.External) {
        return {chartId};
    }

    let source: ItemDataSource = {
        showTitle,
        elementType,
        defaultValue,
        showInnerTitle,
        innerTitle,
        operation,
    };

    if (sourceType === DashTabItemControlSourceType.Dataset) {
        source = {
            ...source,
            datasetId,
            datasetFieldId,
            fieldType,
            datasetFieldType,
        };
    }

    if (sourceType === DashTabItemControlSourceType.Manual) {
        source = {
            ...source,
            fieldName,
            acceptableValues,
        };
    }

    if (elementType === ELEMENT_TYPE.DATE) {
        source = {
            ...source,
            isRange,
            fieldType,
        };
    }

    if (elementType === ELEMENT_TYPE.SELECT) {
        source = {
            ...source,
            multiselectable,
        };
    }

    return source;
};

export const applyControl2Dialog = () => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const selectorDialog = getState().dash.selectorDialog as SelectorDialogState;
        const {title, sourceType, datasetFieldId, fieldName, defaultValue, autoHeight} =
            selectorDialog;
        let defaults = selectorDialog.defaults;

        let field;
        switch (sourceType) {
            case DashTabItemControlSourceType.Manual:
                field = fieldName;
                break;
            case DashTabItemControlSourceType.Dataset:
                field = datasetFieldId;
                break;
            default:
                break;
        }

        const validation: SelectorDialogValidation = {};

        if (!title) {
            validation.title = i18n('dash.control-dialog.edit', 'validation_required');
        }

        if (sourceType === DashTabItemControlSourceType.Manual && !fieldName) {
            validation.fieldName = i18n('dash.control-dialog.edit', 'validation_required');
        }

        if (sourceType === DashTabItemControlSourceType.Dataset && !datasetFieldId) {
            validation.datasetFieldId = i18n('dash.control-dialog.edit', 'validation_required');
        }

        if (isEmpty(validation)) {
            if (field) {
                defaults = {
                    [field]: addOperationForValue({
                        operation: selectorDialog.operation,
                        value: defaultValue || '',
                    }),
                };
            } else {
                defaults = Object.keys(defaults).reduce<Record<string, string | string[]>>(
                    (params, paramTitle) => {
                        if (validateParamTitleOnlyUnderscore(paramTitle) === null) {
                            params[paramTitle] = defaults[paramTitle];
                        }
                        return params;
                    },
                    {},
                );
            }

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
                    defaults: itemData.defaults,
                }),
            );

            dispatch(closeDashDialog());
        } else {
            dispatch(
                setSelectorDialogItem({
                    validation,
                }),
            );
        }
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
