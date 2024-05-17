import type {ConfigItem} from '@gravity-ui/dashkit';
import {DashDragOptions} from 'shared';
import {DIALOG_TYPE} from 'ui/units/dash/containers/Dialogs/constants';
import {ValuesType} from 'utility-types';

import {DashDispatch} from '..';
import * as actionTypes from '../../constants/dashActionTypes';
import {getBeforeOpenDialogItemAction} from '../helpers';

export type OpenDialogAction = {
    type: typeof actionTypes.OPEN_DIALOG;
    payload: {
        openedDialog: ValuesType<typeof DIALOG_TYPE>;
        dragOperationProps?: DashDragOptions;
    };
};

export const openDialog = (
    dialogType: ValuesType<typeof DIALOG_TYPE>,
    dragOperationProps?: DashDragOptions,
): OpenDialogAction => ({
    type: actionTypes.OPEN_DIALOG,
    payload: {
        openedDialog: dialogType,
        dragOperationProps,
    },
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

export const closeDialog = () => {
    return (dispatch: DashDispatch, getState: any) => {
        getState().dash.dragOperationProps?.commit();

        dispatch({
            type: actionTypes.CLOSE_DIALOG,
            payload: {openedDialog: null, openedItemId: null},
        });
    };
};
