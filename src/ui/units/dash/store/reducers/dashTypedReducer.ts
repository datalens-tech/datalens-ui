import React from 'react';

import {DashKit} from '@gravity-ui/dashkit';
import update from 'immutability-helper';
import {cloneDeep, pick} from 'lodash';
import {DashData, DashEntry, WidgetType} from 'shared';

import {Mode} from '../../modules/constants';
import {DashUpdateStatus} from '../../typings/dash';
import {
    ADD_SELECTOR_TO_GROUP,
    CHANGE_NAVIGATION_PATH,
    SET_ACTIVE_SELECTOR_INDEX,
    SET_DASHKIT_REF,
    SET_DASH_ACCESS_DESCRIPTION,
    SET_DASH_DESCRIPTION,
    SET_DASH_DESC_VIEW_MODE,
    SET_DASH_KEY,
    SET_DASH_SUPPORT_DESCRIPTION,
    SET_DASH_UPDATE_STATUS,
    SET_DASH_VIEW_MODE,
    SET_ERROR_MODE,
    SET_HASH_STATE,
    SET_INITIAL_PAGE_TABS_ITEMS,
    SET_LAST_USED_DATASET_ID,
    SET_LOADING_EDIT_MODE,
    SET_PAGE_DEFAULT_TAB_ITEMS,
    SET_PAGE_TAB,
    SET_PAGE_TABS_ITEMS,
    SET_RENAME_WITHOUT_RELOAD,
    SET_SELECTOR_DIALOG_ITEM,
    SET_STATE,
    SET_STATE_HASH_ID,
    SET_TAB_HASH_STATE,
    SelectorDialogState,
    TOGGLE_TABLE_OF_CONTENT,
    TabsHashStates,
    UPDATE_SELECTORS_GROUP,
} from '../actions/dashTyped';
import {DashAction} from '../actions/index';
import {SET_NEW_RELATIONS} from '../constants/dashActionTypes';

import {TAB_PROPERTIES, getSelectorDialogInitialState} from './dash';

// TODO: types for rest state
export type DashState = {
    tabId: null | string;
    hashStates?: null | TabsHashStates;
    stateHashId: null | string;
    initialTabsSettings?: null | DashData['tabs'];
    mode: Mode;
    descriptionMode: Mode;
    navigationPath: null | string;
    dashKitRef: null | React.RefObject<DashKit>;
    error: null | Error;
    openedDialog: null; // TODO: clarify types
    openedItemId: null; // TODO: clarify types
    showTableOfContent: boolean;
    lastUsedDatasetId: null | string;
    entry: DashEntry;
    data: DashData;
    updateStatus: DashUpdateStatus;
    convertedEntryData: DashData | null;
    // permissions: null;
    lockToken: string | null;
    isFullscreenMode?: boolean;
    selectorDialog: SelectorDialogState;
    selectorsGroup: SelectorDialogState[];
    activeSelectorIndex: number;
    isLoadingEditMode: boolean;
    isNewRelationsOpened?: boolean;
    isRenameWithoutReload?: boolean;
    skipReload?: boolean;
    openedItemWidgetType?: WidgetType;
};

// eslint-disable-next-line complexity
export function dashTypedReducer(
    state: DashState,
    action: DashAction<Partial<DashState>>,
): DashState {
    const {hashStates, tabId, data} = state;

    switch (action.type) {
        case SET_STATE:
        case SET_PAGE_TAB:
        case CHANGE_NAVIGATION_PATH:
        case SET_DASHKIT_REF: {
            return {...state, ...action.payload};
        }

        case SET_HASH_STATE: {
            const tabsHashState = {...hashStates} as TabsHashStates;
            const tabIndex: number = data
                ? data.tabs.findIndex(({id}: {id: string}) => id === tabId)
                : -1;
            const config = action.payload.config;
            let newData = {};
            if (config) {
                newData = {
                    data: update(data, {
                        // @ts-ignore
                        tabs: {
                            [tabIndex]: {
                                $set: pick(config, TAB_PROPERTIES),
                            },
                        },
                    }),
                };
            }
            const searchParams = new URLSearchParams(location.search);
            const stateHashId = searchParams.get('state') || state.stateHashId || null;

            if (tabId && hashStates) {
                tabsHashState[tabId] = {
                    hash: hashStates[tabId]?.hash || stateHashId || '',
                    state: action.payload.hashStates,
                };
            }
            return {
                ...state,
                ...newData,
                hashStates: tabsHashState,
                stateHashId,
            };
        }

        case SET_TAB_HASH_STATE: {
            const newHashStates = {
                [action.payload.tabId]: {},
            } as TabsHashStates;
            if (action.payload.stateHashId && action.payload.hashStates) {
                newHashStates[action.payload.tabId] =
                    action.payload.hashStates[action.payload.tabId];
            }

            return {
                ...state,
                tabId: action.payload.tabId,
                stateHashId: action.payload.stateHashId || '',
                hashStates: {
                    ...state.hashStates,
                    ...newHashStates,
                },
            };
        }

        case SET_STATE_HASH_ID: {
            const tabsHashState = {...hashStates} as TabsHashStates;
            const newTabId = action.payload.tabId;
            if (newTabId && hashStates) {
                tabsHashState[newTabId] = {
                    ...tabsHashState[newTabId],
                    hash: action.payload.hash || '',
                };
            }
            // when they did not wait for a response from the request and switched the tab, a desynchronization occurs
            const isActualtabId = tabId === action.payload.tabId;

            return {
                ...state,
                stateHashId: (isActualtabId && action.payload.hash) || '',
                hashStates: tabsHashState,
            };
        }

        case SET_INITIAL_PAGE_TABS_ITEMS: {
            return {
                ...state,
                initialTabsSettings: cloneDeep(state.data.tabs), // via cloneDeep, so that the original ones do not change when changing the order of widgets (needed to reset to default)
            };
        }

        case SET_PAGE_TABS_ITEMS: {
            const tabDataIndex = state.data.tabs.findIndex(
                (item) => item.id === action.payload.tabId,
            );

            const newTabs = cloneDeep(state.data.tabs);
            newTabs[tabDataIndex].items = cloneDeep(action.payload.items);

            return {
                ...state,
                data: {
                    ...state.data,
                    tabs: newTabs,
                },
            };
        }

        case SET_PAGE_DEFAULT_TAB_ITEMS: {
            const newTabs = state.initialTabsSettings // not null or undefined, but an empty array is allowed
                ? cloneDeep(state.initialTabsSettings)
                : cloneDeep(state.convertedEntryData?.tabs || state.entry.data.tabs); // via cloneDeep, so that they do not change when changing the order of widgets (affects the definition of draft)

            return {
                ...state,
                data: {
                    ...state.data,
                    tabs: newTabs,
                },
                initialTabsSettings: null,
            };
        }

        case SET_ERROR_MODE: {
            return {
                ...state,
                ...action.payload,
                mode: Mode.Error,
                openedDialog: null,
                openedItemId: null,
            };
        }

        case TOGGLE_TABLE_OF_CONTENT:
            return {
                ...state,
                showTableOfContent:
                    action.payload === undefined ? !state.showTableOfContent : action.payload,
            };

        case SET_LAST_USED_DATASET_ID:
            return {
                ...state,
                lastUsedDatasetId: action.payload,
            };

        case SET_SELECTOR_DIALOG_ITEM: {
            const {selectorDialog, activeSelectorIndex} = state;
            const {payload} = action;

            const elementTypeChanged =
                payload.elementType && selectorDialog.elementType !== payload.elementType;
            const defaultValue = elementTypeChanged ? undefined : selectorDialog.defaultValue;

            const validation: SelectorDialogState['validation'] = {
                title:
                    selectorDialog.title === payload.title
                        ? selectorDialog.validation.title
                        : undefined,
                fieldName:
                    selectorDialog.fieldName === payload.fieldName
                        ? selectorDialog.validation.fieldName
                        : undefined,
                datasetFieldId:
                    selectorDialog.datasetFieldId === payload.datasetFieldId
                        ? selectorDialog.validation.datasetFieldId
                        : undefined,
            };

            const newSelectorState = {
                ...state.selectorDialog,
                defaultValue,
                validation,
                ...payload,
            };

            let newSelectorsGroupState = [newSelectorState] as SelectorDialogState[];

            if (state.selectorsGroup.length) {
                newSelectorsGroupState = [...state.selectorsGroup];
                newSelectorsGroupState[activeSelectorIndex] = newSelectorState;
            }

            return {
                ...state,
                selectorDialog: newSelectorState,
                selectorsGroup: newSelectorsGroupState,
            };
        }

        case ADD_SELECTOR_TO_GROUP: {
            const {payload} = action;
            const newSelector = getSelectorDialogInitialState();

            return {
                ...state,
                selectorsGroup: [...state.selectorsGroup, {...newSelector, title: payload.title}],
                selectorDialog: {...newSelector, title: payload.title},
            };
        }

        case UPDATE_SELECTORS_GROUP: {
            const {activeSelectorIndex} = state;
            const selectors = action.payload;
            return {
                ...state,
                selectorsGroup: selectors,
                selectorDialog: selectors[activeSelectorIndex],
            };
        }

        case SET_ACTIVE_SELECTOR_INDEX: {
            return {
                ...state,
                activeSelectorIndex: action.payload,
            };
        }

        case SET_DASH_VIEW_MODE: {
            const entryData = state.convertedEntryData || state.entry.data;
            const tabIndex: number = entryData
                ? entryData.tabs.findIndex(({id}: {id: string}) => id === tabId)
                : -1;

            return {
                ...state,
                mode: action.payload?.mode || Mode.View,
                tabId: tabIndex === -1 ? entryData.tabs[0].id : tabId,
                showTableOfContent: entryData.settings?.expandTOC && state.showTableOfContent,
                data: entryData,
            };
        }

        case SET_DASH_DESC_VIEW_MODE: {
            return {
                ...state,
                descriptionMode: action.payload || Mode.View,
            };
        }

        case SET_DASH_DESCRIPTION: {
            return {
                ...state,
                data: {
                    ...state.data,
                    description: action.payload || '',
                },
            };
        }

        case SET_DASH_UPDATE_STATUS: {
            return {
                ...state,
                updateStatus: action.payload,
            };
        }

        case SET_DASH_ACCESS_DESCRIPTION: {
            return {
                ...state,
                data: {
                    ...state.data,
                    accessDescription: action.payload || '',
                },
            };
        }

        case SET_DASH_SUPPORT_DESCRIPTION: {
            return {
                ...state,
                data: {
                    ...state.data,
                    supportDescription: action.payload || '',
                },
            };
        }

        case SET_LOADING_EDIT_MODE: {
            return {
                ...state,
                isLoadingEditMode: action.payload || false,
            };
        }

        case SET_NEW_RELATIONS: {
            return {
                ...state,
                isNewRelationsOpened: action.payload || false,
            };
        }

        case SET_DASH_KEY: {
            return {
                ...state,
                entry: {
                    ...state.entry,
                    key: action.payload,
                },
            };
        }

        case SET_RENAME_WITHOUT_RELOAD: {
            return {
                ...state,
                isRenameWithoutReload: action.payload || false,
            };
        }

        default:
            return state;
    }
}
