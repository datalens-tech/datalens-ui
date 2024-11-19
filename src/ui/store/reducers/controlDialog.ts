import type {DashTabItemControlData, DashTabItemGroupControlData, StringParams} from 'shared';
import {DashTabItemControlSourceType, DashTabItemType, TitlePlacementOption} from 'shared';
import type {SelectorDialogState, SelectorsGroupDialogState} from '../typings/controlDialog';
import {getRandomKey} from 'ui/libs/DatalensChartkit/helpers/helpers';
import {ELEMENT_TYPE} from 'units/dash/containers/Dialogs/Control/constants';
import {CONTROLS_PLACEMENT_MODE} from 'ui/constants/dialogs';
import {extractTypedQueryParams} from 'shared/modules/typed-query-api/helpers/parameters';
import {
    INIT_DIALOG,
    RESET_DIALOG,
    type InitDialogAction,
    type ResetDialogAction,
} from '../actions/controlDialog';
export interface ControlDialogState {
    activeSelectorIndex: number;
    selectorsGroup: SelectorsGroupDialogState;
    selectorDialog: SelectorDialogState;
    openedDialog: DashTabItemType | null;
}

export function getSelectorDialogInitialState(
    args: {
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
});

export function controlDialog(
    state: ControlDialogState = getInitialState(),
    action: InitDialogAction | ResetDialogAction,
): ControlDialogState {
    const {type} = action;
    switch (type) {
        case INIT_DIALOG: {
            const payload = action.payload;
            const {id: openedItemId, data, defaults} = payload;
            let {type: openedDialog} = payload;

            const newState = {
                ...state,
                openedItemId,
                activeSelectorIndex: 0,
            };

            if (
                openedDialog === DashTabItemType.Control &&
                (data as DashTabItemControlData).sourceType !== 'external'
            ) {
                const selectorDialog = getSelectorDialogFromData(data as DashTabItemControlData);

                // migration forward to group
                openedDialog = DashTabItemType.GroupControl;
                newState.selectorsGroup = {
                    ...getGroupSelectorDialogInitialState(),
                    group: [selectorDialog],
                };
                newState.selectorDialog = selectorDialog;
            } else if (openedDialog === DashTabItemType.GroupControl) {
                newState.selectorsGroup = getSelectorGroupDialogFromData(
                    data as DashTabItemGroupControlData,
                );
                newState.selectorDialog = newState.selectorsGroup.group[0];
            } else if (openedDialog === DashTabItemType.Control) {
                newState.selectorDialog = getSelectorDialogFromData(
                    data as DashTabItemControlData,
                    defaults,
                );
            }

            newState.openedDialog = openedDialog;

            return newState;
        }
        case RESET_DIALOG: {
            return getInitialState();
        }
    }
    return state;
}
