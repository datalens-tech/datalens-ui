import {DashTabItemControlData, DashTabItemGroupControlData, DashTabItemType} from 'shared/types';
import {DatalensGlobalState} from 'ui/index';
import {AppDispatch} from 'ui/store';

import {selectOpenedItemData} from '../../selectors/dashTypedSelectors';
import {SetSelectorDialogItemArgs, setItemData} from '../dashTyped';
import {closeDialog as closeDashDialog} from '../dialogs/actions';
import {getExtendedItemDataAction} from '../helpers';

import {getControlDefaultsForField, getControlValidation, getItemDataSource} from './helpers';
import {SelectorsGroupDialogState} from './types';

export const ADD_SELECTOR_TO_GROUP = Symbol('dash/ADD_SELECTOR_TO_GROUP');

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

export const UPDATE_SELECTORS_GROUP = Symbol('dash/UPDATE_SELECTORS_GROUP');

export type UpdateSelectorsGroupAction = {
    type: typeof UPDATE_SELECTORS_GROUP;
    payload: SelectorsGroupDialogState;
};

export const updateSelectorsGroup = (payload: UpdateSelectorsGroupAction['payload']) => {
    return {
        type: UPDATE_SELECTORS_GROUP,
        payload,
    };
};

export const SET_ACTIVE_SELECTOR_INDEX = Symbol('dash/SET_ACTIVE_SELECTOR_INDEX');

export type SetActiveSelectorIndexAction = {
    type: typeof SET_ACTIVE_SELECTOR_INDEX;
    payload: {
        activeSelectorIndex: number;
    };
};

export const setActiveSelectorIndex = (payload: SetActiveSelectorIndexAction['payload']) => {
    return {
        type: SET_ACTIVE_SELECTOR_INDEX,
        payload,
    };
};

export const applyGroupControlDialog = () => {
    return (dispatch: AppDispatch, getState: () => DatalensGlobalState) => {
        const state = getState();
        const {selectorsGroup, openedItemId} = state.dash;

        let firstInvalidIndex: number | null = null;
        const groupFieldNames: Record<string, number> = {};
        selectorsGroup.group.forEach((groupItem) => {
            if (groupItem.fieldName) {
                groupFieldNames[groupItem.fieldName] = groupFieldNames[groupItem.fieldName]
                    ? groupFieldNames[groupItem.fieldName] + 1
                    : 1;
            }
        });

        const validatedSelectorsGroup = Object.assign({}, selectorsGroup);

        // check validation for every control
        for (let i = 0; i < validatedSelectorsGroup.group.length; i += 1) {
            const validation = getControlValidation(
                validatedSelectorsGroup.group[i],
                groupFieldNames,
            );

            if (validation && firstInvalidIndex === null) {
                firstInvalidIndex = i;
            }

            if (validation) {
                validatedSelectorsGroup.group[i].validation = validation;
            }
        }

        if (firstInvalidIndex !== null) {
            dispatch(updateSelectorsGroup(validatedSelectorsGroup));
            dispatch(setActiveSelectorIndex({activeSelectorIndex: firstInvalidIndex}));
            return;
        }

        const isSingleControl = selectorsGroup.group.length === 1;
        const autoHeight =
            !isSingleControl || selectorsGroup.buttonApply || selectorsGroup.buttonReset
                ? selectorsGroup.autoHeight
                : false;

        const data = {
            autoHeight,
            buttonApply: selectorsGroup.buttonApply,
            buttonReset: selectorsGroup.buttonReset,
            group: selectorsGroup.group.map((selector) => {
                let hasChangedSourceType = false;
                if (openedItemId) {
                    const openedItemData = selectOpenedItemData(
                        state,
                    ) as DashTabItemGroupControlData;

                    const configSelectorItem = openedItemData.group?.find(
                        ({id}) => id === selector.id,
                    );

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

        dispatch(
            setItemData({
                data: itemData.data,
                type: DashTabItemType.GroupControl,
            }),
        );

        dispatch(closeDashDialog());
    };
};
