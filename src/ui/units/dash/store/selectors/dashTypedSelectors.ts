import type {Operation} from 'components/DialogFilter/constants';
import {BOOLEAN_OPERATIONS} from 'components/DialogFilter/constants';
import {getAvailableOperations} from 'components/DialogFilter/utils';
import type {DatalensGlobalState} from 'index';
import {getFilterOperations} from 'libs/datasetHelper';
import isEqual from 'lodash/isEqual';
import {createSelector} from 'reselect';
import type {
    DashTabItem,
    DashTabItemControlData,
    DashTabItemWidget,
    DashTabItemWidgetTab,
    Operations,
} from 'shared';
import {DATASET_FIELD_TYPES, DashTabItemControlSourceType} from 'shared';

import {ITEM_TYPE} from '../../../../constants/dialogs';
import {isOrderIdsChanged} from '../../containers/Dialogs/Tabs/PopupWidgetsOrder/helpers';
import {Mode} from '../../modules/constants';
import {
    ALL_OPERATIONS,
    DATEPICKER_OPERATIONS,
    DATEPICKER_RANGE_OPERATIONS,
    INPUT_OPERATIONS_NUMBER_OR_DATE,
    INPUT_OPERATIONS_TEXT,
    MULTISELECT_OPERATIONS,
    SELECTOR_OPERATIONS,
} from '../constants/operations';
import type {DashState} from '../reducers/dashTypedReducer';

export const selectDash = (state: DatalensGlobalState) => state.dash || null;

export const canEdit = (state: DatalensGlobalState) =>
    Boolean(state.dash.permissions && state.dash.permissions.edit);

const selectInitialTabsSettings = (state: DatalensGlobalState) => state.dash.initialTabsSettings;

export const selectDashEntry = (state: DatalensGlobalState) => state.dash.entry || null;

export const selectDashData = (state: DatalensGlobalState) => state.dash?.data || null;

export const selectDashError = (state: DatalensGlobalState) => state.dash.error;

export const selectEntryId = (state: DatalensGlobalState) =>
    state.dash.entry ? state.dash.entry.entryId : null;

export const selectEntryTitle = (state: DatalensGlobalState) =>
    state.dash.entry ? state.dash.entry.key.match(/[^/]*$/)?.toString() : null;

export const selectEntryData = (state: DatalensGlobalState) =>
    state.dash.convertedEntryData || state.dash.entry?.data || null;

export const selectSettings = (state: DatalensGlobalState) => state.dash?.data?.settings || {};

export const selectIsDialogVisible = (state: DatalensGlobalState, dialogType: string) =>
    state.dash.openedDialog === dialogType;

export const selectSelectorSourceType = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.sourceType;

export const selectSelectorControlType = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.elementType;

export const selectSelectorDefaultValue = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.defaultValue;

export const selectSelectorRequired = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.required;

export const selectSelectorValidation = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog.validation;

export const selectSelectorDialog = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorDialog;

export const selectSkipReload = (state: DatalensGlobalState) =>
    (state.dash as DashState)?.skipReload || false;

export const selectWidgetsCurrentTab = (state: DatalensGlobalState) =>
    (state.dash as DashState).widgetsCurrentTab;

export const selectIsControlConfigurationDisabled = (state: DatalensGlobalState) => {
    const selectorDialog = (state.dash as DashState).selectorDialog;

    switch (selectorDialog.sourceType) {
        case DashTabItemControlSourceType.Dataset:
            return !selectorDialog.datasetFieldId;
        case DashTabItemControlSourceType.Connection:
            return !selectorDialog.connectionQueryContent;
        default:
            return false;
    }
};

export const selectIsParametersSectionAvailable = (state: DatalensGlobalState): boolean => {
    const {sourceType, connectionId, connectionQueryTypes} = state.dash.selectorDialog;

    switch (sourceType) {
        case DashTabItemControlSourceType.Connection:
            return Boolean(connectionId && connectionQueryTypes?.length);
        case DashTabItemControlSourceType.External:
            return true;
        default:
            return false;
    }
};

export const getDatasetField = (state: DatalensGlobalState) => {
    const {dataset, datasetFieldId} = (state.dash as DashState).selectorDialog;
    return (dataset?.dataset?.result_schema || dataset?.result_schema || [])?.find(
        (item) => item.guid === datasetFieldId,
    );
};

export const selectAvailableOperationsDict = (
    state: DatalensGlobalState,
): Record<Operations, boolean> | undefined => {
    const {dataset, datasetFieldId} = (state.dash as DashState).selectorDialog;

    if (!dataset) {
        return undefined;
    }

    const field = (dataset?.dataset?.result_schema || dataset?.result_schema || [])?.find(
        (item) => item.guid === datasetFieldId,
    );

    if (!field) {
        return undefined;
    }

    const filterOperations = getFilterOperations(field, dataset.options);

    const availableOperations = getAvailableOperations(field, filterOperations);

    const availableOperationsDict = availableOperations.reduce(
        (acc: Record<Operations, boolean>, item: Operation) => {
            acc[item.value] = true;
            return acc;
        },
        {} as Record<Operations, boolean>,
    );

    return availableOperationsDict;
};

export const selectInputOperations = (state: DatalensGlobalState) => {
    const {multiselectable, isRange, elementType, fieldType, sourceType, datasetFieldId} = (
        state.dash as DashState
    ).selectorDialog;

    if (sourceType !== 'dataset' && elementType === 'checkbox') {
        return BOOLEAN_OPERATIONS;
    }

    if (sourceType !== 'dataset') {
        return ALL_OPERATIONS;
    }

    if (!datasetFieldId) {
        return undefined;
    }

    const availableOperations = selectAvailableOperationsDict(state);

    let inputOperations;

    switch (elementType) {
        case 'select': {
            if (multiselectable) {
                inputOperations = MULTISELECT_OPERATIONS;
                break;
            }

            inputOperations = SELECTOR_OPERATIONS;
            break;
        }

        case 'date': {
            if (isRange) {
                inputOperations = DATEPICKER_RANGE_OPERATIONS;
                break;
            }

            inputOperations = DATEPICKER_OPERATIONS;
            break;
        }

        case 'input': {
            if (fieldType === DATASET_FIELD_TYPES.STRING) {
                inputOperations = INPUT_OPERATIONS_TEXT;
                break;
            }

            inputOperations = INPUT_OPERATIONS_NUMBER_OR_DATE;
            break;
        }

        case 'checkbox': {
            inputOperations = BOOLEAN_OPERATIONS;
            break;
        }
    }

    if (!availableOperations) {
        return inputOperations;
    }

    return inputOperations.filter((operation) => availableOperations[operation.value]);
};

export const selectTabId = (state: DatalensGlobalState) => state.dash?.tabId;

export const selectTabs = (state: DatalensGlobalState) => state.dash.data?.tabs || null;
export const selectTab = (state: DatalensGlobalState) =>
    state.dash.data?.tabs.find(({id}) => id === state.dash.tabId) || null;
export const selectShowTableOfContent = (state: DatalensGlobalState) =>
    state.dash.showTableOfContent;

export const selectHashStates = (state: DatalensGlobalState) => state.dash?.hashStates;

export const selectStateHashId = (state: DatalensGlobalState) => state.dash.stateHashId;

export const selectLoadingEditMode = (state: DatalensGlobalState) => state.dash.isLoadingEditMode;

export const selectDashDescription = (state: DatalensGlobalState) =>
    state.dash.data?.description || '';

export const selectDashDescMode = (state: DatalensGlobalState) =>
    state.dash.descriptionMode || Mode.View;

export const selectDashShowOpenedDescription = (state: DatalensGlobalState) =>
    Boolean(state.dash?.openInfoOnLoad);

export const selectDashAccessDescription = (state: DatalensGlobalState) =>
    state.dash?.data?.accessDescription || '';

export const selectDashSupportDescription = (state: DatalensGlobalState) => {
    const currentPageEntryId = state.asideHeader?.currentPageEntry?.entryId;
    const dashEntryId = state.dash?.entry?.entryId;
    const supportDesc = state.dash?.data?.supportDescription || '';
    return dashEntryId && currentPageEntryId === dashEntryId ? supportDesc : '';
};

export const selectIsNewRelations = (state: DatalensGlobalState) =>
    state.dash?.isNewRelationsOpened || false;

export const selectRenameWithoutReload = (state: DatalensGlobalState) =>
    state.dash.isRenameWithoutReload;

export const selectIsFullscreenMode = (state: DatalensGlobalState) => state.dash.isFullscreenMode;

export const selectDashWorkbookId = (state: DatalensGlobalState) =>
    state.dash?.entry?.workbookId || null;

// reselectors below

export const selectDashMode = createSelector([selectDash], (dash) => dash.mode);

export const isEditMode = createSelector([selectDashMode], (mode) => mode === Mode.Edit);

export const selectDashGlobalDefaultParams = createSelector(
    [selectSettings],
    (settings) => settings.globalParams,
);

export const selectStateMode = createSelector(
    [selectDashMode],
    (dashMode) => dashMode === Mode.SelectState,
);

export const selectTabsMetas = createSelector([selectTabs], (tabs) =>
    tabs ? tabs.map(({id, title}) => ({id, title})) : null,
);

const selectTabsItemsOrderChanged = createSelector(
    [selectInitialTabsSettings, selectTabs],
    (initTabs, currentTabs) => (initTabs ? isOrderIdsChanged(initTabs, currentTabs || []) : false),
);

const selectDashChanged = createSelector([selectDashEntry, selectDashData], (entry, dashData) => {
    return Boolean(entry) && !isEqual({...entry.data, counter: 0}, {...dashData, counter: 0});
});

export const isDraft = createSelector(
    [selectTabsItemsOrderChanged, selectDashChanged],
    (isOrderChanged, isDashChanged) => isOrderChanged || isDashChanged,
);

export const selectCurrentTab = createSelector([selectDashData, selectTabId], (data, tabId) => {
    const tabIndex = data ? data.tabs.findIndex(({id}) => id === tabId) : -1;

    return tabIndex === -1
        ? null
        : {
              ...data.tabs[tabIndex],
              salt: data.salt,
              counter: data.counter,
          };
});

export const selectCurrentTabId = createSelector(
    [selectCurrentTab],
    (currentTab) => currentTab?.id || null,
);

export const selectTabHashStates = createSelector(
    [selectHashStates, selectCurrentTabId],
    (hashStates, currentTabId) => (currentTabId ? hashStates?.[currentTabId] : hashStates) || {},
);

export const selectTabHashState = createSelector(
    [selectTabHashStates],
    (hashStates) => hashStates.state || {},
);

export const hasTableOfContent = createSelector([selectDashData], (dashData) => {
    if (!dashData) {
        return false;
    }
    const {tabs} = dashData;

    return (
        tabs.length > 1 ||
        (tabs.length === 1 &&
            tabs[0].items.some(
                ({type, data}) => type === ITEM_TYPE.TITLE && 'showInTOC' in data && data.showInTOC,
            ))
    );
});

export const selectOpenedItemData = createSelector(
    [selectCurrentTab, selectDash],
    (currentTab, dash) => {
        if (dash.openedItemId && currentTab) {
            const item = currentTab.items.find(({id}) => id === dash.openedItemId);
            return item?.data;
        }
        return undefined;
    },
);

export const selectOpenedItem = createSelector(
    [selectCurrentTab, selectDash],
    (currentTab, dash) => {
        if (dash.openedItemId && currentTab) {
            const item = currentTab.items.find(({id}) => id === dash.openedItemId);
            return item;
        }
        return undefined;
    },
);

export const selectIsControlSourceTypeHasChanged = createSelector(
    [selectOpenedItemData, selectSelectorSourceType],
    (openedItemData, sourceType) => {
        // New item
        if (!openedItemData) {
            return false;
        }

        return (openedItemData as DashTabItemControlData).sourceType !== sourceType;
    },
);

export const selectCurrentTabConnectableItems = createSelector([selectCurrentTab], (currentTab) => {
    if (!currentTab) {
        return undefined;
    }
    return currentTab.items
        .filter(({type}) => type === ITEM_TYPE.CONTROL || type === ITEM_TYPE.WIDGET)
        .reduce(
            (result, {id, data, type, namespace}: DashTabItem) =>
                type === ITEM_TYPE.WIDGET
                    ? result.concat(
                          (data as DashTabItemWidget['data']).tabs.map(
                              (tabItem: DashTabItemWidgetTab) => ({
                                  id: tabItem.id,
                                  namespace,
                                  type,
                                  title: tabItem.title,
                              }),
                          ) as DashTabItem[],
                      )
                    : result.concat([
                          {id, namespace, type, title: 'title' in data ? data.title : ''},
                      ] as DashTabItem[]),
            [] as DashTabItem[],
        );
});

export const selectCurrentTabRelationDataItems = createSelector(
    [selectCurrentTab],
    (currentTab) => {
        if (!currentTab) {
            return undefined;
        }

        return currentTab.items.filter(
            ({type}) =>
                type === ITEM_TYPE.CONTROL ||
                type === ITEM_TYPE.WIDGET ||
                type === ITEM_TYPE.GROUP_CONTROL,
        );
    },
);

export const selectCurrentTabAliases = createSelector(
    [selectCurrentTab],
    (currentTab) => currentTab?.aliases || null,
);
