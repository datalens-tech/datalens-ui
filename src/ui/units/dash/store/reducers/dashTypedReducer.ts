import type React from 'react';

import type {DashKit} from '@gravity-ui/dashkit';
import update from 'immutability-helper';
import {cloneDeep, pick} from 'lodash';
import type {DashData, DashDragOptions, DashEntry, Permissions, WidgetType} from 'shared';
import {
    ADD_SELECTOR_TO_GROUP,
    SET_ACTIVE_SELECTOR_INDEX,
    SET_SELECTOR_DIALOG_ITEM,
    UPDATE_SELECTORS_GROUP,
} from 'ui/store/actions/controlDialog';
import {getSelectorDialogInitialState} from 'ui/store/reducers/controlDialog';
import type {SelectorDialogState, SelectorsGroupDialogState} from 'ui/store/typings/controlDialog';
import {getActualUniqueFieldNameValidation} from 'ui/store/utils/controlDialog';

import {ELEMENT_TYPE} from '../../containers/Dialogs/Control/constants';
import {Mode} from '../../modules/constants';
import type {DashUpdateStatus} from '../../typings/dash';
import type {TabsHashStates} from '../actions/dashTyped';
import {
    CHANGE_NAVIGATION_PATH,
    SET_DASHKIT_REF,
    SET_DASH_ACCESS_DESCRIPTION,
    SET_DASH_DESCRIPTION,
    SET_DASH_DESC_VIEW_MODE,
    SET_DASH_KEY,
    SET_DASH_OPENED_DESC,
    SET_DASH_SUPPORT_DESCRIPTION,
    SET_DASH_UPDATE_STATUS,
    SET_DASH_VIEW_MODE,
    SET_ERROR_MODE,
    SET_HASH_STATE,
    SET_INITIAL_PAGE_TABS_ITEMS,
    SET_LAST_USED_CONNECTION_ID,
    SET_LAST_USED_DATASET_ID,
    SET_LOADING_EDIT_MODE,
    SET_PAGE_DEFAULT_TAB_ITEMS,
    SET_PAGE_TAB,
    SET_PAGE_TABS_ITEMS,
    SET_SETTINGS,
    SET_STATE,
    SET_STATE_HASH_ID,
    SET_TAB_HASH_STATE,
    SET_WIDGET_CURRENT_TAB,
    TOGGLE_TABLE_OF_CONTENT,
} from '../actions/dashTyped';
import type {DashAction} from '../actions/index';
import {SET_NEW_RELATIONS} from '../constants/dashActionTypes';
import {getInitialDefaultValue} from '../utils';

import {TAB_PROPERTIES} from './dash';

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
    openedItemId: string | null;
    showTableOfContent: boolean;
    lastUsedDatasetId: null | string;
    lastUsedConnectionId: undefined | string;
    entry: DashEntry;
    data: DashData;
    updateStatus: DashUpdateStatus;
    convertedEntryData: DashData | null;
    permissions?: Permissions;
    lockToken: string | null;
    isFullscreenMode?: boolean;
    selectorDialog: SelectorDialogState;
    selectorsGroup: SelectorsGroupDialogState;
    activeSelectorIndex: number;
    isLoadingEditMode: boolean;
    isNewRelationsOpened?: boolean;
    skipReload?: boolean;
    openedItemWidgetType?: WidgetType;
    // contains widgetId: currentTabId to open widget dialog with current tab
    widgetsCurrentTab: {[key: string]: string};
    dragOperationProps: DashDragOptions | null;
    openInfoOnLoad?: boolean;
};

// eslint-disable-next-line complexity
export function dashTypedReducer(
    state: DashState,
    action: DashAction<Partial<DashState>>,
): DashState {
    const {hashStates, tabId, data} = state;

    const tabIndex = data ? data.tabs.findIndex(({id}) => id === tabId) : -1;

    switch (action.type) {
        case SET_STATE:
        case SET_PAGE_TAB:
        case CHANGE_NAVIGATION_PATH:
        case SET_DASHKIT_REF: {
            return {...state, ...action.payload};
        }

        case SET_HASH_STATE: {
            const tabsHashState = {...hashStates} as TabsHashStates;
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

        case SET_LAST_USED_CONNECTION_ID:
            return {
                ...state,
                lastUsedConnectionId: action.payload,
            };

        case SET_SELECTOR_DIALOG_ITEM: {
            const {selectorDialog, selectorsGroup, activeSelectorIndex} = state;
            const {payload} = action;

            const elementTypeChanged =
                payload.elementType && selectorDialog.elementType !== payload.elementType;
            const defaultValue = elementTypeChanged
                ? getInitialDefaultValue(payload.elementType!)
                : selectorDialog.defaultValue;
            const isElementTypeWithoutRequired =
                elementTypeChanged && payload.elementType === ELEMENT_TYPE.CHECKBOX;
            const required = isElementTypeWithoutRequired ? false : selectorDialog.required;

            const validation: SelectorDialogState['validation'] = {
                title:
                    selectorDialog.title === payload.title
                        ? selectorDialog.validation.title
                        : undefined,
                uniqueFieldName:
                    selectorDialog.fieldName === payload.fieldName
                        ? getActualUniqueFieldNameValidation(
                              selectorsGroup.group,
                              payload.fieldName,
                              selectorDialog.validation.fieldName,
                          )
                        : undefined,
                fieldName:
                    selectorDialog.fieldName === payload.fieldName
                        ? selectorDialog.validation.fieldName
                        : undefined,
                datasetFieldId:
                    selectorDialog.datasetFieldId === payload.datasetFieldId
                        ? selectorDialog.validation.datasetFieldId
                        : undefined,
                defaultValue:
                    !isElementTypeWithoutRequired &&
                    selectorDialog.defaultValue === payload.defaultValue
                        ? selectorDialog.validation.defaultValue
                        : undefined,
            };

            const newSelectorState = {
                ...state.selectorDialog,
                defaultValue,
                validation,
                required,
                ...payload,
            };

            const newSelectorsGroupState = {
                ...selectorsGroup,
            };

            if (state.selectorsGroup.group.length) {
                newSelectorsGroupState.group = [...selectorsGroup.group];
                newSelectorsGroupState.group[activeSelectorIndex] = newSelectorState;
            }

            return {
                ...state,
                selectorDialog: newSelectorState,
                selectorsGroup: newSelectorsGroupState,
            };
        }

        case ADD_SELECTOR_TO_GROUP: {
            const {payload} = action;
            const newSelector = getSelectorDialogInitialState(
                state.lastUsedDatasetId
                    ? {
                          lastUsedDatasetId: state.lastUsedDatasetId,
                      }
                    : {},
            );

            // if current length is 1, the added selector will be the second so we enable autoHeight
            const autoHeight =
                state.selectorsGroup.group.length === 1 ? true : state.selectorsGroup.autoHeight;

            return {
                ...state,
                selectorsGroup: {
                    ...state.selectorsGroup,
                    group: [...state.selectorsGroup.group, {...newSelector, title: payload.title}],
                    autoHeight,
                },
            };
        }

        case UPDATE_SELECTORS_GROUP: {
            const {selectorsGroup} = state;
            const {group, autoHeight, buttonApply, buttonReset, updateControlsOnChange} =
                action.payload;

            // if the number of selectors has increased from 1 to several, we enable autoHeight
            const updatedAutoHeight =
                selectorsGroup.group.length === 1 && group.length > 1 ? true : autoHeight;

            return {
                ...state,
                selectorsGroup: {
                    ...selectorsGroup,
                    group,
                    autoHeight: updatedAutoHeight,
                    buttonApply,
                    buttonReset,
                    updateControlsOnChange,
                },
            };
        }

        case SET_ACTIVE_SELECTOR_INDEX: {
            const newCurrentSelector =
                state.selectorsGroup.group[action.payload.activeSelectorIndex];

            return {
                ...state,
                activeSelectorIndex: action.payload.activeSelectorIndex,
                selectorDialog: {
                    ...newCurrentSelector,
                    validation: {
                        ...newCurrentSelector.validation,
                        // check if validation with non-unique uniqueFieldName is still valid
                        uniqueFieldName: getActualUniqueFieldNameValidation(
                            state.selectorsGroup.group,
                            newCurrentSelector.fieldName,
                            newCurrentSelector.validation.uniqueFieldName,
                        ),
                    },
                },
            };
        }

        case SET_DASH_VIEW_MODE: {
            const entryData = state.convertedEntryData || state.entry.data;

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

        case SET_DASH_OPENED_DESC: {
            return {
                ...state,
                openInfoOnLoad: Boolean(action.payload),
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

        case SET_SETTINGS:
            return {
                ...state,
                data: update(data, {settings: {$set: action.payload}}),
            };

        case SET_WIDGET_CURRENT_TAB: {
            return {
                ...state,
                widgetsCurrentTab: {
                    ...state.widgetsCurrentTab,
                    [action.payload.widgetId]: action.payload.tabId,
                },
            };
        }

        default:
            return state;
    }
}
