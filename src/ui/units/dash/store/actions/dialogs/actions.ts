import type {ConfigItem} from '@gravity-ui/dashkit';
import {DIALOG_TYPE} from 'ui/units/dash/containers/Dialogs/constants';
import {ValuesType} from 'utility-types';

import {DashDispatch} from '..';
import * as actionTypes from '../../constants/dashActionTypes';
import {getBeforeOpenDialogItemAction} from '../helpers';

export type OpenDialogAction = {
    type: typeof actionTypes.OPEN_DIALOG;
    payload: {openedDialog: ValuesType<typeof DIALOG_TYPE>};
};

export const openDialog = (dialogType: ValuesType<typeof DIALOG_TYPE>): OpenDialogAction => ({
    type: actionTypes.OPEN_DIALOG,
    payload: {openedDialog: dialogType},
});

export type OpenItemDialogAction = {
    type: typeof actionTypes.OPEN_ITEM_DIALOG;
    payload: ConfigItem;
};

export const openItemDialog = (data: ConfigItem): OpenItemDialogAction => ({
    type: actionTypes.OPEN_ITEM_DIALOG,
    payload: data,
});

export const openItemDialogAndSetData = (data: ConfigItem) => {
    return (dispatch: DashDispatch) => {
        const beforeOpenDialogItem = getBeforeOpenDialogItemAction();
        dispatch(beforeOpenDialogItem(data));
        dispatch(openItemDialog(data));
    };
};

export type CloseDialogAction = {
    type: typeof actionTypes.CLOSE_DIALOG;
    payload: {openedDialog: null; openedItemId: null};
};

export const closeDialog = (): CloseDialogAction => ({
    type: actionTypes.CLOSE_DIALOG,
    payload: {openedDialog: null, openedItemId: null},
});
