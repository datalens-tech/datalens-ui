import isEmpty from 'lodash/isEmpty';
import {DashTabItemControlData, DashTabItemType} from 'shared/types';
import {DatalensGlobalState} from 'ui/index';
import {AppDispatch} from 'ui/store';

import {SetSelectorDialogItemArgs, setItemData, setSelectorDialogItem} from '../dashTyped';
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
        const selectorGroup = getState().dash.selectorsGroup;

        let defaults: Record<string, string | string[]> = {};

        // check validation for every control
        for (let i = 0; i < selectorGroup.items.length; i += 1) {
            const validation = getControlValidation(selectorGroup.items[i]);

            if (!isEmpty(validation)) {
                dispatch(setActiveSelectorIndex({activeSelectorIndex: i}));
                dispatch(
                    setSelectorDialogItem({
                        validation,
                    }),
                );
                return;
            }

            defaults = getControlDefaultsForField(defaults, selectorGroup.items[i]);
        }

        const isSingleControl = selectorGroup.items.length === 1;

        const data = {
            autoHeight: isSingleControl ? false : selectorGroup.autoHeight,
            buttonApply: isSingleControl ? false : selectorGroup.buttonApply,
            buttonReset: isSingleControl ? false : selectorGroup.buttonReset,
            items: selectorGroup.items.map((selector) => {
                return {
                    id: selector.id,
                    title: selector.title,
                    sourceType: selector.sourceType,
                    source: getItemDataSource(selector) as DashTabItemControlData['source'],
                    placementMode: isSingleControl ? 'auto' : selector.placementMode,
                    width: isSingleControl ? '' : selector.width,
                    defaults: getControlDefaultsForField({}, selector),
                };
            }),
        };

        const getExtendedItemData = getExtendedItemDataAction();
        const itemData = dispatch(getExtendedItemData({data, defaults}));

        dispatch(
            setItemData({
                data: itemData.data,
                type: DashTabItemType.GroupControl,
                defaults: itemData.defaults,
            }),
        );

        dispatch(closeDashDialog());
    };
};
