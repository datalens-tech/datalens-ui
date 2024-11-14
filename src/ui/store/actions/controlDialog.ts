import type {SelectorsGroupDialogState, SetSelectorDialogItemArgs} from '../typings/controlDialog';

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
