import type {
    DashTabItem,
    DashTabItemControlData,
    DashTabItemGroupControlData,
    EntryScope,
    StringParams,
} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType, TitlePlacementOption} from 'shared';
import type {SelectorDialogState, SelectorsGroupDialogState} from '../typings/controlDialog';
import {getRandomKey} from 'ui/libs/DatalensChartkit/helpers/helpers';
import {CONTROLS_PLACEMENT_MODE} from 'ui/constants/dialogs';
import {extractTypedQueryParams} from 'shared/modules/typed-query-api/helpers/parameters';
import {
    ADD_SELECTOR_TO_GROUP,
    INIT_DIALOG,
    RESET_DIALOG,
    SET_ACTIVE_SELECTOR_INDEX,
    SET_SELECTOR_DIALOG_ITEM,
    UPDATE_SELECTORS_GROUP,
    SET_LAST_USED_DATASET_ID,
    SET_LAST_USED_CONNECTION_ID,
} from '../actions/controlDialog';
import type {
    SetLastUsedDatasetIdAction,
    SetLastUsedConnectionIdAction,
    InitDialogAction,
    ResetDialogAction,
    SetSelectorDialogItemAction,
    SetActiveSelectorIndexAction,
    UpdateSelectorsGroupAction,
    AddSelectorToGroupAction,
} from '../actions/controlDialog';
import {getActualUniqueFieldNameValidation, getInitialDefaultValue} from '../utils/controlDialog';
import {I18n} from 'i18n';
import {ELEMENT_TYPE} from '../constants/controlDialog';

const i18n = I18n.keyset('dash.store.view');

export type ControlDialogStateItemMeta = {
    scope: EntryScope;
    currentTabId: string | null;
    entryId: string | null;
    workbookId: string | null;
    namespace: string | null;
};
export interface ControlDialogState {
    activeSelectorIndex: number;
    selectorsGroup: SelectorsGroupDialogState;
    selectorDialog: SelectorDialogState;
    openedDialog: DashTabItemType | null;
    openedItemId: string | null;
    openedItemData: DashTabItem['data'] | null;
    openedItemMeta: ControlDialogStateItemMeta | null;

    lastUsedDatasetId?: string;
    lastUsedConnectionId?: string;
}

export function getSelectorDialogInitialState(
    args: {
        title?: string | null;
        lastUsedDatasetId?: string;
        lastUsedConnectionId?: string;
        openedDialog?: DashTabItemType.Control | DashTabItemType.GroupControl;
    } = {},
): SelectorDialogState {
    const sourceType =
        args.openedDialog === DashTabItemType.Control
            ? DashTabItemControlSourceType.External
            : DashTabItemControlSourceType.Dataset;

    return {
        elementType: ELEMENT_TYPE.SELECT,
        validation: {},
        sourceType,
        defaults: {},
        datasetId: args.lastUsedDatasetId,
        connectionId: args.lastUsedConnectionId,
        showTitle: true,
        titlePlacement: TitlePlacementOption.Left,
        placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
        width: '',
        required: false,
        showHint: false,
        draftId: getRandomKey(),
        ...(args.title ? {title: args.title} : {}),
    };
}

export function getGroupSelectorDialogInitialState(): SelectorsGroupDialogState {
    return {
        autoHeight: false,
        buttonApply: false,
        buttonReset: false,
        updateControlsOnChange: true,
        group: [],
    };
}

export function getSelectorDialogFromData(
    data: DashTabItemControlData & {source: {[key: string]: any}},
    defaults?: StringParams | null,
): SelectorDialogState {
    let selectorParameters;

    switch (data.sourceType) {
        case DashTabItemControlSourceType.Connection:
            selectorParameters = extractTypedQueryParams(defaults ?? {}, data.source.fieldName);
            break;
        case DashTabItemControlSourceType.External:
            selectorParameters = defaults ?? {};
            break;
        default:
            selectorParameters = {};
    }

    return {
        validation: {},
        isManualTitle: true,

        defaults: defaults ?? {},

        title: data.title,
        sourceType: data.sourceType,
        autoHeight: data.autoHeight,

        datasetId: data.source.datasetId,
        connectionId: data.source.connectionId,
        selectorParameters,
        connectionQueryType: data.source.connectionQueryType,
        connectionQueryTypes: data.source.connectionQueryTypes,
        connectionQueryContent: data.source.connectionQueryContent,
        elementType: data.source.elementType || ELEMENT_TYPE.SELECT,
        defaultValue: data.source.defaultValue,
        datasetFieldId: data.source.datasetFieldId,
        showTitle: data.source.showTitle,
        titlePlacement: data.source.titlePlacement,
        multiselectable: data.source.multiselectable,
        isRange: data.source.isRange,
        fieldName: data.source.fieldName,
        fieldType: data.source.fieldType,
        datasetFieldType: data.source.datasetFieldType,
        acceptableValues: data.source.acceptableValues,
        chartId: data.source.chartId,
        operation: data.source.operation,
        innerTitle: data.source.innerTitle,
        showInnerTitle: data.source.showInnerTitle,
        required: data.source.required,
        showHint: data.source.showHint,
        hint: data.source.hint,

        placementMode: data.placementMode || CONTROLS_PLACEMENT_MODE.AUTO,
        width: data.width || '',

        id: data.id,
        namespace: data.namespace,
    };
}

export function getSelectorGroupDialogFromData(data: DashTabItemGroupControlData) {
    return {
        updateControlsOnChange: false,
        ...data,
        group: data.group.map((item) => getSelectorDialogFromData(item)),
    };
}

const getInitialState = (): ControlDialogState => ({
    activeSelectorIndex: 0,
    selectorsGroup: getGroupSelectorDialogInitialState(),
    selectorDialog: getSelectorDialogInitialState(),
    openedDialog: null,
    openedItemId: null,
    openedItemData: null,
    openedItemMeta: null,
});

// eslint-disable-next-line complexity
export function controlDialog(
    state: ControlDialogState = getInitialState(),
    action:
        | InitDialogAction
        | ResetDialogAction
        | SetSelectorDialogItemAction
        | SetActiveSelectorIndexAction
        | UpdateSelectorsGroupAction
        | AddSelectorToGroupAction
        | SetLastUsedDatasetIdAction
        | SetLastUsedConnectionIdAction,
): ControlDialogState {
    const {type} = action;
    switch (type) {
        case INIT_DIALOG: {
            const payload = action.payload;
            const {id: openedItemId, type: openedDialog, data, defaults, openedItemMeta} = payload;

            const newState = {
                ...state,
                openedItemData: {...data},
                openedDialog,
                openedItemId,
                openedItemMeta,
                activeSelectorIndex: 0,
            };

            if (
                openedItemId === null &&
                (openedDialog === DashTabItemType.Control ||
                    openedDialog === DashTabItemType.GroupControl)
            ) {
                newState.selectorDialog = getSelectorDialogInitialState({
                    title:
                        openedDialog === DashTabItemType.GroupControl
                            ? i18n('label_selector-dialog')
                            : null,
                    lastUsedDatasetId: state.lastUsedDatasetId,
                    lastUsedConnectionId: state.lastUsedConnectionId,
                    openedDialog,
                });
                newState.selectorsGroup = {
                    ...getGroupSelectorDialogInitialState(),
                    group: [newState.selectorDialog],
                };
            } else if (
                openedDialog === DashTabItemType.Control &&
                (data as unknown as DashTabItemControlData).sourceType !== 'external'
            ) {
                const selectorDialog = getSelectorDialogFromData(
                    data as unknown as DashTabItemControlData,
                );

                // migration forward to group
                newState.openedDialog = DashTabItemType.GroupControl;
                newState.selectorsGroup = {
                    ...getGroupSelectorDialogInitialState(),
                    group: [selectorDialog],
                };
                newState.selectorDialog = selectorDialog;
            } else if (openedDialog === DashTabItemType.GroupControl) {
                newState.selectorsGroup = getSelectorGroupDialogFromData(
                    data as unknown as DashTabItemGroupControlData,
                );
                newState.selectorDialog = newState.selectorsGroup.group[0];
            } else if (openedDialog === DashTabItemType.Control) {
                newState.selectorDialog = getSelectorDialogFromData(
                    data as unknown as DashTabItemControlData,
                    defaults,
                );
            }

            return newState;
        }

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

        case RESET_DIALOG: {
            return getInitialState();
        }

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

        default:
            return state;
    }
}
