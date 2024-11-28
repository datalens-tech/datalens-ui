import {DashTabItemType, TitlePlacementOption} from 'shared';
import type {
    DashTabItem,
    DashTabItemControlData,
    DashTabItemGroupControl,
    StringParams,
} from 'shared';
import type {SelectorsGroupDialogState, SetSelectorDialogItemArgs} from '../typings/controlDialog';
import type {AppDispatch} from '..';
import {
    getControlDefaultsForField,
    getControlValidation,
    getItemDataSource,
} from '../utils/controlDialog';
import isEmpty from 'lodash/isEmpty';
import {
    getBeforeCloseDialogItemAction,
    getExtendedItemDataAction,
} from 'ui/units/dash/store/actions/helpers';
import {showToast} from './toaster';
import {I18n} from 'i18n';
import type {ControlDialogStateItemMeta} from '../reducers/controlDialog';
import {getGroupSelectorDialogInitialState} from '../reducers/controlDialog';
import {DEFAULT_CONTROL_LAYOUT} from 'ui/components/DashKit/constants';
import {COPIED_WIDGET_STORAGE_KEY} from 'ui/constants';
import type {ConfigItemGroup} from '@gravity-ui/dashkit/helpers';
import {DEFAULT_NAMESPACE} from '@gravity-ui/dashkit/helpers';
import {CONTROLS_PLACEMENT_MODE} from 'ui/constants/dialogs';
import type {PreparedCopyItemOptions} from '@gravity-ui/dashkit';
import {getPreparedCopyItemOptions, type CopiedConfigContext} from 'ui/units/dash/modules/helpers';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';
import type {DatalensGlobalState} from 'ui/index';
import {
    selectActiveSelectorIndex,
    selectIsControlSourceTypeHasChanged,
    selectOpenedItemData,
    selectOpenedItemId,
    selectOpenedItemMeta,
    selectSelectorDialog,
    selectSelectorsGroup,
} from '../selectors/controlDialog';

const dialogI18n = I18n.keyset('dash.group-controls-dialog.edit');

export const INIT_DIALOG = Symbol('controlDialog/INIT_DIALOG');

export type InitDialogAction = {
    type: typeof INIT_DIALOG;
    payload: {
        id: string | null;
        data: DashTabItem['data'];
        type: DashTabItemType;
        defaults?: StringParams | null;
        openedItemMeta: ControlDialogStateItemMeta;
    };
};

export const initControlDialog = (payload: InitDialogAction['payload']): InitDialogAction => {
    return {
        type: INIT_DIALOG,
        payload,
    };
};

export const RESET_DIALOG = Symbol('controlDialog/RESET_DIALOG');

export type ResetDialogAction = {
    type: typeof RESET_DIALOG;
};

export const resetControlDialog = (): ResetDialogAction => {
    return {
        type: RESET_DIALOG,
    };
};

export const ADD_SELECTOR_TO_GROUP = Symbol('controlDialog/ADD_SELECTOR_TO_GROUP');

export type AddSelectorToGroupAction = {
    type: typeof ADD_SELECTOR_TO_GROUP;
    payload: SetSelectorDialogItemArgs;
};

export const addSelectorToGroup = (
    payload: AddSelectorToGroupAction['payload'],
): AddSelectorToGroupAction => {
    return {
        type: ADD_SELECTOR_TO_GROUP,
        payload,
    };
};

export const UPDATE_SELECTORS_GROUP = Symbol('controlDialog/UPDATE_SELECTORS_GROUP');

export type UpdateSelectorsGroupAction = {
    type: typeof UPDATE_SELECTORS_GROUP;
    payload: SelectorsGroupDialogState;
};

export const updateSelectorsGroup = (
    payload: UpdateSelectorsGroupAction['payload'],
): UpdateSelectorsGroupAction => {
    return {
        type: UPDATE_SELECTORS_GROUP,
        payload,
    };
};

export const SET_ACTIVE_SELECTOR_INDEX = Symbol('controlDialog/SET_ACTIVE_SELECTOR_INDEX');

export type SetActiveSelectorIndexAction = {
    type: typeof SET_ACTIVE_SELECTOR_INDEX;
    payload: {
        activeSelectorIndex: number;
    };
};

export const setActiveSelectorIndex = (
    payload: SetActiveSelectorIndexAction['payload'],
): SetActiveSelectorIndexAction => {
    return {
        type: SET_ACTIVE_SELECTOR_INDEX,
        payload,
    };
};

export const SET_SELECTOR_DIALOG_ITEM = Symbol('controlDialog/SET_SELECTOR_DIALOG_ITEM');

export type SetSelectorDialogItemAction = {
    type: typeof SET_SELECTOR_DIALOG_ITEM;
    payload: SetSelectorDialogItemArgs;
};

export const setSelectorDialogItem = (
    payload: SetSelectorDialogItemAction['payload'],
): SetSelectorDialogItemAction => {
    return {
        type: SET_SELECTOR_DIALOG_ITEM,
        payload,
    };
};

export const SET_LAST_USED_DATASET_ID = Symbol('controlDialog/SET_LAST_USED_DATASET_ID');
export type SetLastUsedDatasetIdAction = {
    type: typeof SET_LAST_USED_DATASET_ID;
    payload: string;
};

export const setLastUsedDatasetId = (datasetId: string): SetLastUsedDatasetIdAction => ({
    type: SET_LAST_USED_DATASET_ID,
    payload: datasetId,
});

export const SET_LAST_USED_CONNECTION_ID = Symbol('controlDialog/SET_LAST_USED_CONNECTION_ID');
export type SetLastUsedConnectionIdAction = {
    type: typeof SET_LAST_USED_CONNECTION_ID;
    payload: string;
};

export const setLastUsedConnectionId = (connectionId: string): SetLastUsedConnectionIdAction => ({
    type: SET_LAST_USED_CONNECTION_ID,
    payload: connectionId,
});

export const applyGroupControlDialog = ({
    setItemData,
    closeDialog,
}: {
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const selectorsGroup = selectSelectorsGroup(state);
        const activeSelectorIndex = selectActiveSelectorIndex(state);
        const openedItemData = selectOpenedItemData(state);
        const openedItemId = selectOpenedItemId(state);

        let firstInvalidIndex: number | null = null;
        const groupFieldNames: Record<string, string[]> = {};
        selectorsGroup.group.forEach((groupItem) => {
            if (groupItem.fieldName) {
                const itemName = groupItem.title;
                if (groupFieldNames[groupItem.fieldName] && itemName) {
                    groupFieldNames[groupItem.fieldName].push(itemName);
                }

                if (!groupFieldNames[groupItem.fieldName] && itemName) {
                    groupFieldNames[groupItem.fieldName] = [itemName];
                }
            }
        });

        const validatedSelectorsGroup = Object.assign({}, selectorsGroup);

        // check validation for every control
        for (let i = 0; i < validatedSelectorsGroup.group.length; i += 1) {
            const validation = getControlValidation(
                validatedSelectorsGroup.group[i],
                groupFieldNames,
            );

            if (!isEmpty(validation) && firstInvalidIndex === null) {
                firstInvalidIndex = i;
            }

            validatedSelectorsGroup.group[i].validation = validation;
        }

        if (firstInvalidIndex !== null) {
            const activeSelectorValidation =
                validatedSelectorsGroup.group[activeSelectorIndex].validation;
            dispatch(updateSelectorsGroup(validatedSelectorsGroup));

            if (!isEmpty(activeSelectorValidation)) {
                dispatch(
                    setSelectorDialogItem({
                        validation: activeSelectorValidation,
                    }),
                );
                return;
            }
            dispatch(setActiveSelectorIndex({activeSelectorIndex: firstInvalidIndex}));
            return;
        }

        const isSingleControl = selectorsGroup.group.length === 1;
        const autoHeight =
            !isSingleControl ||
            selectorsGroup.buttonApply ||
            selectorsGroup.buttonReset ||
            selectorsGroup.group[0].titlePlacement === TitlePlacementOption.Top
                ? selectorsGroup.autoHeight
                : false;
        const updateControlsOnChange =
            !isSingleControl && selectorsGroup.buttonApply
                ? selectorsGroup.updateControlsOnChange
                : false;

        const data = {
            autoHeight,
            buttonApply: selectorsGroup.buttonApply,
            buttonReset: selectorsGroup.buttonReset,
            updateControlsOnChange,
            group: selectorsGroup.group.map((selector) => {
                let hasChangedSourceType = false;
                if (openedItemId) {
                    const configSelectorItem = (
                        openedItemData as DashTabItemGroupControl['data']
                    ).group?.find(({id}) => id === selector.id);

                    // we check changing of sourceType only if selector was already saved and it's not the old one
                    hasChangedSourceType = configSelectorItem
                        ? configSelectorItem.sourceType !== selector.sourceType
                        : false;
                }

                return {
                    id: selector.id,
                    title: selector.title,
                    sourceType: selector.sourceType,
                    source: getItemDataSource(selector) as DashTabItemControlData['source'],
                    placementMode: isSingleControl ? 'auto' : selector.placementMode,
                    width: isSingleControl ? '' : selector.width,
                    defaults: getControlDefaultsForField(selector, hasChangedSourceType),
                    namespace: selector.namespace,
                };
            }),
        };

        const getExtendedItemData = getExtendedItemDataAction();
        const itemData = dispatch(getExtendedItemData({data}));

        setItemData({...itemData, type: DashTabItemType.GroupControl});
        closeDialog();
    };
};

export const copyControlToStorage = (controlIndex: number) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const selectorsGroup = selectSelectorsGroup(state);
        const activeSelectorIndex = selectActiveSelectorIndex(state);
        const {
            workbookId,
            scope,
            entryId,
            namespace,
            currentTabId: tabId,
        } = selectOpenedItemMeta(state);
        const validation = getControlValidation(selectorsGroup.group[controlIndex]);

        if (!scope) {
            return;
        }

        if (!isEmpty(validation)) {
            if (activeSelectorIndex !== controlIndex) {
                dispatch(setActiveSelectorIndex({activeSelectorIndex: controlIndex}));
            }

            dispatch(
                setSelectorDialogItem({
                    validation,
                }),
            );

            dispatch(
                showToast({
                    type: 'danger',
                    title: dialogI18n('label_copy-invalid-control'),
                }),
            );

            return;
        }

        // logic is copied from dashkit
        const selectorToCopy = selectorsGroup.group[controlIndex];

        const copiedItem = {
            id: selectorToCopy.id,
            title: selectorToCopy.title,
            sourceType: selectorToCopy.sourceType,
            source: getItemDataSource(selectorToCopy) as DashTabItemControlData['source'],
            defaults: getControlDefaultsForField(selectorToCopy),
            namespace: namespace || DEFAULT_NAMESPACE,
            width: '',
            placementMode: CONTROLS_PLACEMENT_MODE.AUTO,
        };

        const options: PreparedCopyItemOptions<CopiedConfigContext> = {
            timestamp: Date.now(),
            data: {
                ...getGroupSelectorDialogInitialState(),
                group: [copiedItem as unknown as ConfigItemGroup],
            },
            type: DashTabItemType.GroupControl,
            defaults: copiedItem.defaults,
            namespace: copiedItem.namespace,
            layout: DEFAULT_CONTROL_LAYOUT,
            targetId: selectorToCopy.id,
        };

        const preparedOptions = getPreparedCopyItemOptions(options, null, {
            workbookId: workbookId ?? null,
            fromScope: scope,
            targetDashTabId: tabId,
            targetEntryId: entryId,
        });

        localStorage.setItem(COPIED_WIDGET_STORAGE_KEY, JSON.stringify(preparedOptions));
        // https://stackoverflow.com/questions/35865481/storage-event-not-firing
        window.dispatchEvent(new Event('storage'));
    };
};

export const applyExternalControlDialog = ({
    closeDialog,
    setItemData,
}: {
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
}) => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const selectorDialog = selectSelectorDialog(state);
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

        setItemData({
            data: itemData.data,
            type: DashTabItemType.Control,
            defaults: itemData.defaults,
        });
        closeDialog();
    };
};

export const closeExternalControlDialog = ({closeDialog}: {closeDialog: () => void}) => {
    return (dispatch: AppDispatch) => {
        const beforeCloseDialogItem = getBeforeCloseDialogItemAction();
        dispatch(beforeCloseDialogItem());
        closeDialog();
    };
};
