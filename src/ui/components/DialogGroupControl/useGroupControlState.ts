import React from 'react';

import {DashTabItemControlSourceType, DashTabItemType, TitlePlacementOption} from 'shared';
import type {DashTabItemGroupControlData, StringParams} from 'shared';
import {extractTypedQueryParams} from 'shared/modules/typed-query-api/helpers/parameters';
import {getRandomKey} from 'ui/libs/DatalensChartkit/helpers/helpers';
import {ELEMENT_TYPE} from 'ui/units/dash/containers/Dialogs/Control/constants';
import {CONTROLS_PLACEMENT_MODE} from 'ui/units/dash/containers/Dialogs/constants';
import type {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';
import type {
    SelectorDialogState,
    SetSelectorDialogItemArgs,
} from 'ui/units/dash/store/actions/dashTyped';

export function getSelectorDialogInitialState(
    args: {
        openedDialog?: DashTabItemType.Control | DashTabItemType.GroupControl;
        lastUsedDatasetId?: string;
        lastUsedConnectionId?: string;
    } = {},
) {
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
    data: any, //TODO FIX DashTabItemControlSingle,
    defaults?: StringParams,
): SelectorDialogState {
    let selectorParameters;

    switch (data.sourceType) {
        case DashTabItemControlSourceType.Connection:
            selectorParameters = extractTypedQueryParams(defaults, data.source.fieldName);
            break;
        case DashTabItemControlSourceType.External:
            selectorParameters = defaults;
            break;
        default:
            selectorParameters = {};
    }

    return {
        validation: {},
        isManualTitle: true,

        defaults: defaults ? defaults : {},

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

export const getSelectorGroupDialogFromData = (
    initialState: DashTabItemGroupControlData,
): SelectorsGroupDialogState => {
    return {
        updateControlsOnChange: false,
        ...initialState,
        group: initialState.group.map((g) => getSelectorDialogFromData(g)),
    };
};

type SetActiveIndexGroupControlAction = {
    type: 'activeSelectorIndex';
    payload: {
        activeSelectorIndex: number;
    };
};

type UpdateGroupControlAction = {
    type: 'updateSelectorsGroup';
    payload: SelectorsGroupDialogState;
};

type AddSelectorsToGroupAction = {
    type: 'addSelectorsToGroup';
    payload: SetSelectorDialogItemArgs;
};

type UpdateCurrentSelectorGroupAction = {
    type: 'updateCurrentSelectorGroup';
    payload: SetSelectorDialogItemArgs;
};

const groupControlReducer = (
    state: {
        activeSelectorIndex: number;
        selectorsGroup: SelectorsGroupDialogState;
    },
    action:
        | SetActiveIndexGroupControlAction
        | UpdateGroupControlAction
        | AddSelectorsToGroupAction
        | UpdateCurrentSelectorGroupAction,
) => {
    const {type, payload} = action;

    switch (type) {
        case 'updateCurrentSelectorGroup': {
            const {activeSelectorIndex, selectorsGroup} = state;
            const currentGroupSelector = selectorsGroup.group[activeSelectorIndex];

            return {
                ...state,
                selectorsGroup: {
                    ...selectorsGroup,
                    group: [
                        ...selectorsGroup.group.slice(0, activeSelectorIndex),
                        {...currentGroupSelector, ...payload},
                        ...selectorsGroup.group.slice(activeSelectorIndex + 1),
                    ],
                },
            };
        }
        case 'addSelectorsToGroup': {
            const newSelector = getSelectorDialogInitialState();
            // payload.lastUsedDatasetId ? {lastUsedDatasetId: payload.lastUsedDatasetId} : {},

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

        case 'updateSelectorsGroup': {
            const {selectorsGroup} = state;
            const {group, autoHeight, buttonApply, buttonReset, updateControlsOnChange} = payload;

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
        case 'activeSelectorIndex': {
            return {
                ...state,
                activeSelectorIndex: payload.activeSelectorIndex,
            };
        }
    }

    return state;
};

export const useGroupControlState = (initialState?: DashTabItemGroupControlData) => {
    const [state, dispatch] = React.useReducer(groupControlReducer, {
        activeSelectorIndex: 0,
        selectorsGroup: initialState
            ? getSelectorGroupDialogFromData(initialState)
            : getGroupSelectorDialogInitialState(),
    });

    const setActiveSelectorIndex = React.useCallback(
        (index: number) => {
            dispatch({
                type: 'activeSelectorIndex',
                payload: {activeSelectorIndex: index},
            });
        },
        [dispatch],
    );

    const updateSelectorsGroup = React.useCallback(
        (payload: SelectorsGroupDialogState) => {
            dispatch({type: 'updateSelectorsGroup', payload});
        },
        [dispatch],
    );

    const addSelectorToGroup = React.useCallback(
        (payload: AddSelectorsToGroupAction['payload']) => {
            dispatch({
                type: 'addSelectorsToGroup',
                payload,
            });
        },
        [dispatch],
    );

    const updateCurrentSelectorGroup = React.useCallback(
        (payload: SetSelectorDialogItemArgs) => {
            dispatch({type: 'updateCurrentSelectorGroup', payload});
        },
        [dispatch],
    );

    return {
        dispatch,
        setActiveSelectorIndex,
        updateSelectorsGroup,
        addSelectorToGroup,
        updateCurrentSelectorGroup,
        state,
    };
};
